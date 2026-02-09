
-- Force RLS on profiles table to prevent anonymous/service bypass
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Force RLS on transactions table to prevent anonymous/service bypass
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;
