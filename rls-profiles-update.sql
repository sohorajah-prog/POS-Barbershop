DROP POLICY IF EXISTS "Enable insert own profile" ON profiles;
CREATE POLICY "Enable insert profile" ON profiles FOR INSERT TO authenticated WITH CHECK (
    id = (select auth.uid()) 
    OR 
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);
