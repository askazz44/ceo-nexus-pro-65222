-- Fix 1: Add authorization check to get_dashboard_stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id uuid)
 RETURNS TABLE(total_projects bigint, total_income numeric, total_expense numeric, currency text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Authorization check: only allow users to access their own data
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id)::BIGINT,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0),
    COALESCE(MAX(p.currency), 'EUR')
  FROM projects p
  LEFT JOIN transactions t ON t.project_id = p.id
  WHERE p.user_id = p_user_id;
END;
$function$;

-- Fix 2: Add authorization check to get_period_comparison
CREATE OR REPLACE FUNCTION public.get_period_comparison(p_user_id uuid)
 RETURNS TABLE(current_income numeric, current_expense numeric, previous_income numeric, previous_expense numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Authorization check: only allow users to access their own data
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  RETURN QUERY
  WITH current_month AS (
    SELECT 
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
    FROM projects p
    LEFT JOIN transactions t ON t.project_id = p.id
    WHERE p.user_id = p_user_id
      AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  ),
  previous_month AS (
    SELECT 
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
    FROM projects p
    LEFT JOIN transactions t ON t.project_id = p.id
    WHERE p.user_id = p_user_id
      AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE)
  )
  SELECT 
    cm.income,
    cm.expense,
    pm.income,
    pm.expense
  FROM current_month cm, previous_month pm;
END;
$function$;

-- Fix 3: Create trigger function to enforce project limits
CREATE OR REPLACE FUNCTION public.check_project_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.can_create_project(NEW.user_id) THEN
    RAISE EXCEPTION 'Project limit reached for your subscription tier. Please upgrade to create more projects.';
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix 4: Create trigger to enforce project limits on INSERT
DROP TRIGGER IF EXISTS enforce_project_limit ON public.projects;
CREATE TRIGGER enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_project_limit();