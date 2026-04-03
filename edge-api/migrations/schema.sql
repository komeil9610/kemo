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
  '[{"label":"الدعم","url":"tel:+966558232644"},{"label":"واتساب","url":"https://wa.me/966558232644"},{"label":"اتصل بنا","url":"tel:+966558232644"}]',
  '[{"platform":"instagram","url":"https://instagram.com/tarkeebpro"},{"platform":"x","url":"https://x.com/tarkeebpro"},{"platform":"linkedin","url":"https://linkedin.com/company/tarkeebpro"}]',
  'جميع الحقوق محفوظة لكميل'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_kicker TEXT NOT NULL DEFAULT 'Tarkeeb Pro Operations',
  hero_title TEXT NOT NULL DEFAULT 'Manage customer service and operations from one internal system.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Dedicated workspaces for customer service and the operations manager.',
  primary_button_text TEXT NOT NULL DEFAULT 'Sign in',
  primary_button_url TEXT NOT NULL DEFAULT '/login',
  secondary_button_text TEXT NOT NULL DEFAULT 'Open login',
  secondary_button_url TEXT NOT NULL DEFAULT '/login',
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
  'Manage customer service and operations from one internal system.',
  'Dedicated workspaces for customer service and the operations manager.',
  'Sign in',
  '/login',
  'Open login',
  '/login',
  '[{"value":"2","label":"Office roles"},{"value":"1","label":"Unified operations system"},{"value":"Instant","label":"Live coordination"}]'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS technicians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);

CREATE TABLE IF NOT EXISTS service_time_standards (
  standard_key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  ar_label TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  sort_order INTEGER NOT NULL DEFAULT 1
);

INSERT INTO service_time_standards (standard_key, label, ar_label, duration_minutes, sort_order)
VALUES
  ('split_installation', 'Wall split installation', 'تركيب مكيف سبليت جداري', 120, 1),
  ('cassette_installation', 'Cassette AC installation', 'تركيب مكيف كاسيت', 180, 2),
  ('preventive_maintenance', 'Preventive maintenance', 'صيانة وقائية', 45, 3)
ON CONFLICT(standard_key) DO UPDATE SET
  label = excluded.label,
  ar_label = excluded.ar_label,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order;

CREATE TABLE IF NOT EXISTS internal_area_clusters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  area_key TEXT NOT NULL,
  label TEXT NOT NULL,
  ar_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(city, district)
);

INSERT INTO internal_area_clusters (city, district, area_key, label, ar_label, sort_order)
VALUES
  ('Dammam', 'Al Shatea', 'zone-a', 'Zone A', 'المنطقة أ', 1),
  ('Dammam', 'Al Zuhour', 'zone-a', 'Zone A', 'المنطقة أ', 1),
  ('Dammam', 'Al Fakhriyah', 'zone-b', 'Zone B', 'المنطقة ب', 2),
  ('Riyadh', 'Al Yasmin', 'riyadh-north-1', 'North Riyadh 1', 'شمال الرياض 1', 3)
ON CONFLICT(city, district) DO UPDATE SET
  area_key = excluded.area_key,
  label = excluded.label,
  ar_label = excluded.ar_label,
  sort_order = excluded.sort_order,
  updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  request_number TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  secondary_phone TEXT NOT NULL DEFAULT '',
  whatsapp_phone TEXT NOT NULL DEFAULT '',
  district TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  address_text TEXT NOT NULL DEFAULT '',
  landmark TEXT NOT NULL DEFAULT '',
  map_link TEXT NOT NULL DEFAULT '',
  ac_type TEXT NOT NULL,
  service_category TEXT NOT NULL DEFAULT 'split_installation',
  standard_duration_minutes INTEGER NOT NULL DEFAULT 120,
  work_started_at TEXT,
  completion_note TEXT NOT NULL DEFAULT '',
  delay_reason TEXT NOT NULL DEFAULT '',
  delay_note TEXT NOT NULL DEFAULT '',
  work_type TEXT NOT NULL DEFAULT '',
  ac_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  delivery_type TEXT NOT NULL DEFAULT 'none',
  preferred_date TEXT NOT NULL DEFAULT '',
  preferred_time TEXT NOT NULL DEFAULT '',
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL DEFAULT '',
  coordination_note TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT NOT NULL DEFAULT '',
  customer_action TEXT NOT NULL DEFAULT 'none',
  reschedule_reason TEXT NOT NULL DEFAULT '',
  cancellation_reason TEXT NOT NULL DEFAULT '',
  canceled_at TEXT,
  completed_at TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  proof_status TEXT NOT NULL DEFAULT 'pending_review',
  approved_at TEXT,
  approved_by TEXT NOT NULL DEFAULT '',
  client_signature TEXT NOT NULL DEFAULT '',
  zamil_closure_status TEXT NOT NULL DEFAULT 'idle',
  zamil_close_requested_at TEXT,
  zamil_otp_code TEXT NOT NULL DEFAULT '',
  zamil_otp_submitted_at TEXT,
  zamil_closed_at TEXT,
  suspension_reason TEXT NOT NULL DEFAULT '',
  suspension_note TEXT NOT NULL DEFAULT '',
  suspended_at TEXT,
  exception_status TEXT NOT NULL DEFAULT 'none',
  audit_log_json TEXT NOT NULL DEFAULT '[]',
  technician_id INTEGER,
  copper_meters REAL NOT NULL DEFAULT 0,
  base_included INTEGER NOT NULL DEFAULT 0,
  extras_total REAL NOT NULL DEFAULT 0,
  service_items_json TEXT NOT NULL DEFAULT '[]',
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
  ('خدمة العملاء', 'customer-service@tarkeebpro.sa', '70b4b3f2bbc28083db439cac1d94b3d85d41a3e5135faadc45deee8ff6974a29', 'customer_service', 'active'),
  ('مدير العمليات', 'operations@tarkeebpro.sa', '7c31f434dcc0dfe876cdb3be7905406e0b0ea8a73e91e0ee48f4f855730e23fe', 'operations_manager', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

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
