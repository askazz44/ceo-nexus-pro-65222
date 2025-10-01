-- Update subscription tiers to match new pricing structure
-- First, remove the default constraint
ALTER TABLE profiles ALTER COLUMN subscription_tier DROP DEFAULT;

-- Rename old enum
ALTER TYPE subscription_tier RENAME TO subscription_tier_old;

-- Create new enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business', 'lifetime');

-- Update profiles table to use new enum
ALTER TABLE profiles 
  ALTER COLUMN subscription_tier TYPE subscription_tier 
  USING CASE subscription_tier::text
    WHEN 'free' THEN 'free'::subscription_tier
    WHEN 'monthly_6' THEN 'pro'::subscription_tier
    WHEN 'monthly_10' THEN 'pro'::subscription_tier
    WHEN 'monthly_unlimited' THEN 'business'::subscription_tier
    WHEN 'lifetime' THEN 'lifetime'::subscription_tier
    ELSE 'free'::subscription_tier
  END;

-- Set new default
ALTER TABLE profiles ALTER COLUMN subscription_tier SET DEFAULT 'free'::subscription_tier;

-- Drop old enum with CASCADE to remove dependent functions
DROP TYPE subscription_tier_old CASCADE;

-- Recreate get_project_limit function with new enum
CREATE OR REPLACE FUNCTION public.get_project_limit(tier subscription_tier)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE tier
    WHEN 'free' THEN 2
    WHEN 'pro' THEN 5
    WHEN 'business' THEN 999999
    WHEN 'lifetime' THEN 999999
    ELSE 2
  END
$$;

-- Recreate can_create_project function  
CREATE OR REPLACE FUNCTION public.can_create_project(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_tier subscription_tier;
  current_count INTEGER;
  max_projects INTEGER;
BEGIN
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = user_id;

  SELECT COUNT(*) INTO current_count
  FROM public.projects
  WHERE projects.user_id = can_create_project.user_id;

  max_projects := public.get_project_limit(user_tier);

  RETURN current_count < max_projects;
END;
$$;