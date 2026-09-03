CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> is_admin.user_id THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND user_roles.role = 'admin'
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.apply_referral(referral_code_input text, new_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_profile_id UUID;
  referrer_count INTEGER;
  email_verified BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> new_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  SELECT (email_confirmed_at IS NOT NULL) INTO email_verified
  FROM auth.users WHERE id = new_user_id;

  IF email_verified IS NULL OR email_verified = false THEN
    RETURN false;
  END IF;

  SELECT id INTO referrer_profile_id
  FROM profiles
  WHERE referral_code = upper(referral_code_input) AND id <> new_user_id;

  IF referrer_profile_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE profiles SET referred_by = referrer_profile_id WHERE id = new_user_id;

  INSERT INTO referrals (referrer_id, referred_id, status)
  VALUES (referrer_profile_id, new_user_id, 'completed');

  UPDATE profiles SET referral_count = referral_count + 1
  WHERE id = referrer_profile_id
  RETURNING referral_count INTO referrer_count;

  IF referrer_count >= 3 THEN
    UPDATE profiles
    SET subscription_tier = 'pro', referral_reward_claimed = true
    WHERE id = referrer_profile_id AND referral_reward_claimed = false;
  END IF;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_referral(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_referral(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.apply_referral(text, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_dashboard_stats(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_dashboard_stats(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.get_period_comparison(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_period_comparison(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_period_comparison(uuid) TO authenticated, service_role;