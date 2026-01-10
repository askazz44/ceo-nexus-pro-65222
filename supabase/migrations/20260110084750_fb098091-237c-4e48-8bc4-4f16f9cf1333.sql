-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_dashboard_stats(uuid);
DROP FUNCTION IF EXISTS public.get_period_comparison(uuid);

-- Recreate dashboard stats function with savings
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id uuid)
 RETURNS TABLE(total_projects bigint, total_income numeric, total_expense numeric, total_savings numeric, currency text)
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
    COALESCE(SUM(CASE WHEN t.type = 'savings' THEN t.amount ELSE 0 END), 0),
    COALESCE(MAX(p.currency), 'EUR')
  FROM projects p
  LEFT JOIN transactions t ON t.project_id = p.id
  WHERE p.user_id = p_user_id;
END;
$function$;

-- Recreate period comparison function with savings
CREATE OR REPLACE FUNCTION public.get_period_comparison(p_user_id uuid)
 RETURNS TABLE(current_income numeric, current_expense numeric, current_savings numeric, previous_income numeric, previous_expense numeric, previous_savings numeric)
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
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense,
      COALESCE(SUM(CASE WHEN t.type = 'savings' THEN t.amount ELSE 0 END), 0) as savings
    FROM projects p
    LEFT JOIN transactions t ON t.project_id = p.id
    WHERE p.user_id = p_user_id
      AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  ),
  previous_month AS (
    SELECT 
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense,
      COALESCE(SUM(CASE WHEN t.type = 'savings' THEN t.amount ELSE 0 END), 0) as savings
    FROM projects p
    LEFT JOIN transactions t ON t.project_id = p.id
    WHERE p.user_id = p_user_id
      AND t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND t.transaction_date < DATE_TRUNC('month', CURRENT_DATE)
  )
  SELECT 
    cm.income,
    cm.expense,
    cm.savings,
    pm.income,
    pm.expense,
    pm.savings
  FROM current_month cm, previous_month pm;
END;
$function$;