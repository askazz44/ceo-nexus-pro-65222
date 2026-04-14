-- Fix referrals: remove the dangerous INSERT policy that allows arbitrary referrer_id
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated users can insert referrals" ON public.referrals;

-- Remove any INSERT policies on referrals - all inserts go through apply_referral() SECURITY DEFINER function
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'referrals' AND schemaname = 'public' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.referrals', pol.policyname);
  END LOOP;
END $$;

-- Add user_roles SELECT policy so users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);