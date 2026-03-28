PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'device',
  city TEXT NOT NULL DEFAULT 'Riyadh',
  price_per_day REAL NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  image_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_product_id ON bookings(product_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS footer_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  about_text TEXT NOT NULL DEFAULT 'Tarkeeb Pro منصة موثوقة لإدارة طلبات التركيب والفنيين بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  useful_links_json TEXT NOT NULL DEFAULT '[]',
  customer_service_links_json TEXT NOT NULL DEFAULT '[]',
  social_links_json TEXT NOT NULL DEFAULT '[]',
  copyright_text TEXT NOT NULL DEFAULT 'جميع الحقوق محفوظة لكميل',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO footer_settings (
  id,
  about_text,
  useful_links_json,
  customer_service_links_json,
  social_links_json,
  copyright_text
)
VALUES (
  1,
  'Tarkeeb Pro منصة موثوقة لإدارة طلبات التركيب والفنيين بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  '[{"label":"الرئيسية","url":"/"},{"label":"المنتجات","url":"/products"},{"label":"طلباتي","url":"/orders"}]',
  '[{"label":"الدعم الفني","url":"mailto:ops@tarkeebpro.sa"},{"label":"واتساب","url":"https://wa.me/966500000000"},{"label":"الأسئلة الشائعة","url":"/"}]',
  '[{"platform":"instagram","url":"https://instagram.com/tarkeebpro"},{"platform":"x","url":"https://x.com/tarkeebpro"},{"platform":"linkedin","url":"https://linkedin.com/company/tarkeebpro"}]',
  'جميع الحقوق محفوظة لكميل'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_kicker TEXT NOT NULL DEFAULT 'Tarkeeb Pro Operations',
  hero_title TEXT NOT NULL DEFAULT 'Manage installation jobs and technicians in one place.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Assign field technicians, track execution, and manage service orders across Saudi Arabia.',
  primary_button_text TEXT NOT NULL DEFAULT 'Open Dashboard',
  primary_button_url TEXT NOT NULL DEFAULT '/dashboard',
  secondary_button_text TEXT NOT NULL DEFAULT 'Technician View',
  secondary_button_url TEXT NOT NULL DEFAULT '/tasks',
  stats_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO home_settings (
  id,
  hero_kicker,
  hero_title,
  hero_subtitle,
  primary_button_text,
  primary_button_url,
  secondary_button_text,
  secondary_button_url,
  stats_json
)
VALUES (
  1,
  'Tarkeeb Pro Operations',
  'Manage installation jobs and technicians in one place.',
  'Assign field technicians, track execution, and manage service orders across Saudi Arabia.',
  'Open Dashboard',
  '/dashboard',
  'Technician View',
  '/tasks',
  '[{"value":"1","label":"Admin account"},{"value":"1","label":"Seeded technician"},{"value":"85 SAR","label":"Copper meter price"}]'
)
ON CONFLICT(id) DO NOTHING;

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

INSERT INTO service_orders (
  customer_name,
  phone,
  address,
  ac_type,
  status,
  scheduled_date,
  notes,
  technician_id,
  copper_meters,
  base_included,
  extras_total,
  created_by_user_id
)
SELECT
  'أبو خالد',
  '+966555000111',
  'حي الياسمين - الرياض',
  'سبليت 24 ألف وحدة',
  'pending',
  '2026-03-29',
  'الدور الثاني - يوجد مصعد',
  t.id,
  2,
  1,
  350,
  u.id
FROM users u
JOIN technicians t ON t.user_id = (SELECT id FROM users WHERE email = 'fahad@tarkeebpro.sa')
WHERE u.email = 'admin@tarkeebpro.sa'
  AND NOT EXISTS (SELECT 1 FROM service_orders WHERE customer_name = 'أبو خالد' AND phone = '+966555000111');

INSERT INTO service_orders (
  customer_name,
  phone,
  address,
  ac_type,
  status,
  scheduled_date,
  notes,
  technician_id,
  copper_meters,
  base_included,
  extras_total,
  created_by_user_id
)
SELECT
  'أم ناصر',
  '+966555000222',
  'حي النرجس - الرياض',
  'شباك 18 ألف وحدة',
  'in_progress',
  '2026-03-28',
  'الموقع يحتاج تواصل قبل الوصول بـ 30 دقيقة',
  t.id,
  4,
  0,
  340,
  u.id
FROM users u
JOIN technicians t ON t.user_id = (SELECT id FROM users WHERE email = 'salman@tarkeebpro.sa')
WHERE u.email = 'admin@tarkeebpro.sa'
  AND NOT EXISTS (SELECT 1 FROM service_orders WHERE customer_name = 'أم ناصر' AND phone = '+966555000222');

-- Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
