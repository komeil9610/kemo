PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS technicians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);

CREATE TABLE IF NOT EXISTS service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  ac_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  technician_id INTEGER,
  copper_meters REAL NOT NULL DEFAULT 0,
  base_included INTEGER NOT NULL DEFAULT 0,
  extras_total REAL NOT NULL DEFAULT 0,
  created_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_technician_id ON service_orders(technician_id);

CREATE TABLE IF NOT EXISTS service_order_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  image_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by_user_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_service_order_photos_order_id ON service_order_photos(order_id);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',
  related_order_id INTEGER,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('مسؤول تركيب برو', 'admin@tarkeebpro.sa', '6260a7306f61fcb20ec28f9a6b037bd4edbaaa66bfd73d94997faffa60141e95', 'admin', 'active'),
  ('فهد القحطاني', 'fahad@tarkeebpro.sa', '57119cdea6dc559b0d80e71208737269598d08f23b04f20eda198b889ca95541', 'technician', 'active'),
  ('سلمان الدوسري', 'salman@tarkeebpro.sa', '0aab8aeaa6d15ef0cac12a8a9e8aac27387e18abccc583036d66ac6bc7fadd4c', 'technician', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

INSERT INTO technicians (user_id, name, phone, zone, status)
SELECT id, 'فهد القحطاني', '+966500001111', 'شرق الرياض', 'available'
FROM users
WHERE email = 'fahad@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status;

INSERT INTO technicians (user_id, name, phone, zone, status)
SELECT id, 'سلمان الدوسري', '+966500002222', 'شمال الرياض', 'busy'
FROM users
WHERE email = 'salman@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status;
