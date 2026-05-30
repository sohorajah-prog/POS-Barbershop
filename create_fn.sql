CREATE OR REPLACE FUNCTION get_user_outlet()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) LIMIT 1;
$$;
