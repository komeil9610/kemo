ALTER TABLE service_orders ADD COLUMN zamil_closure_status TEXT NOT NULL DEFAULT 'idle';
ALTER TABLE service_orders ADD COLUMN zamil_close_requested_at TEXT;
ALTER TABLE service_orders ADD COLUMN zamil_otp_code TEXT NOT NULL DEFAULT '';
ALTER TABLE service_orders ADD COLUMN zamil_otp_submitted_at TEXT;
ALTER TABLE service_orders ADD COLUMN zamil_closed_at TEXT;
