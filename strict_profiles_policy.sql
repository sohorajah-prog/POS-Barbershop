DROP POLICY IF EXISTS "Enable read all profiles" ON public.profiles;

CREATE POLICY "Enable read all profiles" ON public.profiles FOR SELECT TO authenticated USING (
  id = (select auth.uid())
);
