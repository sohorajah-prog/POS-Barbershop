-- Drop overly permissive policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON outlets;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON kapsters;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON services;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON shifts;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON transaction_items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON walkin_queue;

-- OUTLETS: Any authenticated user can read outlets (needed for signup bootstrap)
CREATE POLICY "Enable read outlets" ON outlets FOR SELECT TO authenticated USING (true);
-- Only users who belong to the outlet AND are admins can update it
CREATE POLICY "Enable update outlets" ON outlets FOR UPDATE TO authenticated USING (
    id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
) WITH CHECK (
    id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
);

-- PROFILES: Users can read and update their own profile, and insert their own profile
CREATE POLICY "Enable insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (id = (select auth.uid()));
CREATE POLICY "Enable select own profile" ON profiles FOR SELECT TO authenticated USING (id = (select auth.uid()));
CREATE POLICY "Enable update own profile" ON profiles FOR UPDATE TO authenticated USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

-- For other tables (kapsters, services, products, shifts, transactions, walkin_queue), 
-- users can do EVERYTHING as long as it belongs to their outlet!
CREATE POLICY "Enable ALL kapsters" ON kapsters FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Enable ALL services" ON services FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Enable ALL products" ON products FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Enable ALL shifts" ON shifts FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Enable ALL transactions" ON transactions FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);

-- Note: transaction_items does not have outlet_id directly, it uses transaction_id. 
-- For simplicity, we can join transactions, but it's simpler to just let them access transaction_items 
-- if they are authenticated (or we can secure it properly).
CREATE POLICY "Enable ALL transaction_items" ON transaction_items FOR ALL TO authenticated USING (
    transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN profiles p ON t.outlet_id = p.outlet_id 
        WHERE p.id = (select auth.uid())
    )
) WITH CHECK (
    transaction_id IN (
        SELECT t.id FROM transactions t 
        JOIN profiles p ON t.outlet_id = p.outlet_id 
        WHERE p.id = (select auth.uid())
    )
);

CREATE POLICY "Enable ALL walkin_queue" ON walkin_queue FOR ALL TO authenticated USING (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
) WITH CHECK (
    outlet_id IN (SELECT outlet_id FROM profiles WHERE id = (select auth.uid()))
);
