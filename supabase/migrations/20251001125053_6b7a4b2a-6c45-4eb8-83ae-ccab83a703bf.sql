-- Update get_project_limit function to reflect new Pro tier limit of 10 projects
CREATE OR REPLACE FUNCTION public.get_project_limit(tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT CASE tier
    WHEN 'free' THEN 2
    WHEN 'pro' THEN 10
    WHEN 'business' THEN 999999
    WHEN 'lifetime' THEN 999999
    ELSE 2
  END
$function$;