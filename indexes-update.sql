-- PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_outlet_id ON profiles(outlet_id);

-- KAPSTERS
CREATE INDEX IF NOT EXISTS idx_kapsters_outlet_id ON kapsters(outlet_id);

-- SERVICES
CREATE INDEX IF NOT EXISTS idx_services_outlet_id ON services(outlet_id);

-- PRODUCTS
CREATE INDEX IF NOT EXISTS idx_products_outlet_id ON products(outlet_id);

-- SHIFTS
CREATE INDEX IF NOT EXISTS idx_shifts_outlet_id ON shifts(outlet_id);
CREATE INDEX IF NOT EXISTS idx_shifts_cashier_id ON shifts(cashier_id);

-- TRANSACTIONS
CREATE INDEX IF NOT EXISTS idx_transactions_outlet_id ON transactions(outlet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shift_id ON transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier_id ON transactions(cashier_id);

-- TRANSACTION ITEMS
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_kapster_id ON transaction_items(kapster_id);

-- WALKIN QUEUE
CREATE INDEX IF NOT EXISTS idx_walkin_queue_outlet_id ON walkin_queue(outlet_id);
CREATE INDEX IF NOT EXISTS idx_walkin_queue_service_id ON walkin_queue(service_id);
CREATE INDEX IF NOT EXISTS idx_walkin_queue_kapster_id ON walkin_queue(kapster_id);
