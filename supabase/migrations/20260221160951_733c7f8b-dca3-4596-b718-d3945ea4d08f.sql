
-- Update apply_referral to require email verification before counting referrals
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
  -- Require email verification before referral counts
  SELECT (email_confirmed_at IS NOT NULL) INTO email_verified
  FROM auth.users
  WHERE id = new_user_id;

  IF email_verified IS NULL OR email_verified = false THEN
    RETURN false;
  END IF;

  -- Find referrer by code
  SELECT id INTO referrer_profile_id
  FROM profiles
  WHERE referral_code = upper(referral_code_input)
  AND id != new_user_id;
  
  IF referrer_profile_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update referred user
  UPDATE profiles
  SET referred_by = referrer_profile_id
  WHERE id = new_user_id;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, status)
  VALUES (referrer_profile_id, new_user_id, 'completed');
  
  -- Increment referrer count
  UPDATE profiles
  SET referral_count = referral_count + 1
  WHERE id = referrer_profile_id
  RETURNING referral_count INTO referrer_count;
  
  -- Check if referrer reached 3 referrals and hasn't claimed reward
  IF referrer_count >= 3 THEN
    UPDATE profiles
    SET subscription_tier = 'pro',
        referral_reward_claimed = true
    WHERE id = referrer_profile_id
    AND referral_reward_claimed = false;
  END IF;
  
  RETURN true;
END;
$function$;
