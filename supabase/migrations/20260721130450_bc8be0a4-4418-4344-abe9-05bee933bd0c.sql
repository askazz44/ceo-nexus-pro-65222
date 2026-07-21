
-- 1. Protect profile subscription/stripe fields via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_subscription_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (webhooks/edge functions) to modify anything
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For all other callers, protected columns must remain unchanged
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.referral_reward_claimed IS DISTINCT FROM OLD.referral_reward_claimed
     OR NEW.referral_count IS DISTINCT FROM OLD.referral_count
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'You are not allowed to modify subscription, billing, or referral fields.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_subscription_fields ON public.profiles;
CREATE TRIGGER protect_profile_subscription_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_subscription_tampering();

-- 2. Referrals: explicit deny for INSERT/UPDATE/DELETE by clients
-- (apply_referral is SECURITY DEFINER and bypasses these)
DROP POLICY IF EXISTS "No client inserts on referrals" ON public.referrals;
CREATE POLICY "No client inserts on referrals"
  ON public.referrals FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "No client updates on referrals" ON public.referrals;
CREATE POLICY "No client updates on referrals"
  ON public.referrals FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No client deletes on referrals" ON public.referrals;
CREATE POLICY "No client deletes on referrals"
  ON public.referrals FOR DELETE
  TO authenticated, anon
  USING (false);

-- 3. user_roles: explicit admin-only INSERT/UPDATE/DELETE policies
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 4. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.can_create_project(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_project_limit() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_project_limit(subscription_tier) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_subscription_tampering() FROM anon, authenticated, PUBLIC;

-- Keep client-callable RPCs available only to authenticated users
REVOKE EXECUTE ON FUNCTION public.apply_referral(text, uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_period_comparison(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_referral(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_period_comparison(uuid) TO authenticated;
