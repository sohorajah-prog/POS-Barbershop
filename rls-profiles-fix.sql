DROP POLICY IF EXISTS "Enable select own profile" ON profiles;
DROP POLICY IF EXISTS "Enable select profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert profile" ON profiles;
DROP POLICY IF EXISTS "Enable update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update profiles" ON profiles;

-- Anyone logged in can read all profiles
CREATE POLICY "Enable read all profiles" ON profiles FOR SELECT TO authenticated USING (true);

-- Users can insert their own profile, OR Admins can insert profiles for their outlet
CREATE POLICY "Enable insert profile" ON profiles FOR INSERT TO authenticated WITH CHECK (
    id = (select auth.uid()) 
    OR 
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- Users can update their own profile, OR Admins can update profiles in their outlet
CREATE POLICY "Enable update profiles" ON profiles FOR UPDATE TO authenticated USING (
    id = (select auth.uid()) 
    OR 
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
) WITH CHECK (
    id = (select auth.uid()) 
    OR 
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);
