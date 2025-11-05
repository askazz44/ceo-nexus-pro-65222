-- Funzione RPC per statistiche dashboard ottimizzate
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  total_projects BIGINT,
  total_income NUMERIC,
  total_expense NUMERIC,
  currency TEXT
) AS $$
BEGIN
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Funzione per confronto periodi (mese corrente vs mese precedente)
CREATE OR REPLACE FUNCTION get_period_comparison(p_user_id UUID)
RETURNS TABLE (
  current_income NUMERIC,
  current_expense NUMERIC,
  previous_income NUMERIC,
  previous_expense NUMERIC
) AS $$
BEGIN
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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;