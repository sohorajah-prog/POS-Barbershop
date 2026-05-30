CREATE OR REPLACE VIEW public.v_profiles AS
SELECT * FROM public.profiles
WHERE outlet_id = (SELECT outlet_id FROM public.profiles p2 WHERE p2.id = (select auth.uid()) LIMIT 1);

GRANT SELECT ON public.v_profiles TO authenticated;
