-- Create extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- OUTLETS
CREATE TABLE outlets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    tagline TEXT,
    tax_rate NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PROFILES (Linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- KAPSTERS
CREATE TABLE kapsters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    commission_type TEXT DEFAULT 'percentage',
    commission_value NUMERIC DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICES
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    duration INTEGER DEFAULT 0,
    price NUMERIC DEFAULT 0,
    commission_type TEXT DEFAULT 'percentage',
    commission_value NUMERIC DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- SHIFTS
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    cashier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    start_cash NUMERIC DEFAULT 0,
    end_cash NUMERIC DEFAULT 0,
    expected_cash NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'open'
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts ON DELETE CASCADE,
    cashier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date TIMESTAMPTZ DEFAULT now(),
    subtotal NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    tip NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    method TEXT,
    customer_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSACTION ITEMS
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT REFERENCES transactions ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC DEFAULT 0,
    qty INTEGER DEFAULT 1,
    type TEXT,
    kapster_id UUID REFERENCES kapsters(id) ON DELETE SET NULL,
    commission_type TEXT,
    commission_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- WALKIN QUEUE
CREATE TABLE walkin_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outlet_id UUID REFERENCES outlets ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    kapster_id UUID REFERENCES kapsters(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'waiting',
    time TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kapsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE walkin_queue ENABLE ROW LEVEL SECURITY;

-- Disable RLS for now during setup/admin tasks (We'll rely on app logic for this demo, or we can use authenticated role)
CREATE POLICY "Enable all for authenticated users" ON outlets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON kapsters FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON transaction_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON walkin_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert Default Outlet
INSERT INTO outlets (name, tagline) VALUES ('Barbershop', 'Sistem Kasir & POS Barbershop Premium');
