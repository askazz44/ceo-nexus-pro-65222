-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT false;

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-char alphanumeric code
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- Generate codes for existing users
UPDATE public.profiles 
SET referral_code = upper(substr(md5(random()::text || id::text), 1, 8))
WHERE referral_code IS NULL;

-- Function to apply referral on signup
CREATE OR REPLACE FUNCTION public.apply_referral(referral_code_input TEXT, new_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_profile_id UUID;
  referrer_count INTEGER;
BEGIN
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
$$;