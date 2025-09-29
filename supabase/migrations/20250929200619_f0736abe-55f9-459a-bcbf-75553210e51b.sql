-- Fix search_path for get_project_limit function
CREATE OR REPLACE FUNCTION public.get_project_limit(tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE tier
    WHEN 'free' THEN 3
    WHEN 'monthly_6' THEN 6
    WHEN 'monthly_10' THEN 10
    WHEN 'monthly_unlimited' THEN 999999
    WHEN 'lifetime' THEN 999999
    ELSE 3
  END
$$;

-- Fix search_path for can_create_project function
CREATE OR REPLACE FUNCTION public.can_create_project(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier subscription_tier;
  current_count INTEGER;
  max_projects INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = user_id;

  -- Get current project count
  SELECT COUNT(*) INTO current_count
  FROM public.projects
  WHERE projects.user_id = can_create_project.user_id;

  -- Get max allowed projects
  max_projects := public.get_project_limit(user_tier);

  RETURN current_count < max_projects;
END;
$$;

-- Fix search_path for update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;