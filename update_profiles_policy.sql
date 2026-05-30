DROP POLICY IF EXISTS "Enable read all profiles" ON public.profiles;

CREATE POLICY "Enable read all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  outlet_id = get_user_outlet()
);
