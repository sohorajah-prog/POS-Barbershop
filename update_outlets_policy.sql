DROP POLICY IF EXISTS "Enable read outlets" ON public.outlets;
CREATE POLICY "Enable read outlets" ON public.outlets FOR SELECT TO authenticated USING (
  id IN (SELECT outlet_id FROM profiles WHERE id = (SELECT auth.uid()))
);
