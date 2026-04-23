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

CREATE TABLE IF NOT EXISTS user_workspace_roles (
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_workspace_roles_role ON user_workspace_roles(role);

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
  about_text TEXT NOT NULL DEFAULT 'TrkeebPro منصة موثوقة لإدارة طلبات التركيب والفنيين بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
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
  'تركيب برو لخدمات تركيب وصيانة المكيفات بخبرة عالية، سرعة في الوصول، وضمان على جودة العمل.',
  '[{"label":"Home","url":"/"},{"label":"Login","url":"/login"}]',
  '[{"label":"Support","url":"tel:0558232644"},{"label":"WhatsApp","url":"https://wa.me/966558232644"},{"label":"Call us","url":"tel:0558232644"}]',
  '[{"platform":"whatsapp","url":"https://wa.me/966558232644"}]',
  '© 2026 TrkeebPro'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_kicker TEXT NOT NULL DEFAULT 'تركيب برو',
  hero_title TEXT NOT NULL DEFAULT 'تركيب وصيانة المكيفات باحترافية عالية',
  hero_subtitle TEXT NOT NULL DEFAULT 'خدمة سريعة | أسعار منافسة | ضمان على العمل',
  primary_button_text TEXT NOT NULL DEFAULT 'احجز الآن',
  primary_button_url TEXT NOT NULL DEFAULT '#contact',
  secondary_button_text TEXT NOT NULL DEFAULT 'تواصل عبر واتساب',
  secondary_button_url TEXT NOT NULL DEFAULT 'https://wa.me/966558232644',
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
  'تركيب برو',
  'تركيب وصيانة المكيفات باحترافية عالية',
  'خدمة سريعة | أسعار منافسة | ضمان على العمل',
  'احجز الآن',
  '#contact',
  'تواصل عبر واتساب',
  'https://wa.me/966558232644',
  '{"contentVersion":2,"heroNote":"متخصصون في تركيب وصيانة جميع أنواع المكيفات بخبرة عالية وفريق فني محترف، مع اهتمام بالتفاصيل وسرعة في التنفيذ.","heroHighlights":["خدمة سريعة","أسعار منافسة","ضمان على العمل"],"stats":[{"value":"6","label":"خدمات رئيسية"},{"value":"24/7","label":"استجابة سريعة"},{"value":"100%","label":"اهتمام بالنظافة والجودة"}],"aboutTitle":"من نحن","aboutText":"نحن في \"تركيب برو\" متخصصون في تركيب وصيانة جميع أنواع المكيفات، بخبرة عالية وفريق فني محترف. نضمن لك جودة العمل وسرعة التنفيذ بأفضل الأسعار.","servicesTitle":"خدماتنا","services":["تركيب مكيفات سبليت","تركيب مكيفات شباك","فك ونقل المكيفات","صيانة وتنظيف المكيفات","تعبئة فريون","كشف الأعطال"],"featuresTitle":"لماذا تختارنا؟","features":["فنيين محترفين","سرعة في الوصول","أسعار مناسبة","ضمان على الخدمة","خدمة عملاء ممتازة"],"galleryTitle":"أعمالنا","galleryImages":[{"title":"تركيب احترافي","caption":"تنفيذ مرتب واهتمام كامل بالتفاصيل وجودة التشطيب.","imageUrl":"/home-gallery-1.jpg"},{"title":"خدمة ميدانية سريعة","caption":"وصول سريع وتجهيز كامل لخدمة جميع أنواع المكيفات.","imageUrl":"/home-gallery-2.webp"},{"title":"صيانة وتنظيف","caption":"حلول صيانة وتنظيف تعيد كفاءة التبريد وتحافظ على عمر الجهاز.","imageUrl":"/home-gallery-3.jpg"}],"testimonialsTitle":"آراء العملاء","testimonials":["خدمة ممتازة وسريعة، أنصح فيهم","أسعارهم مناسبة وشغلهم نظيف"],"contactTitle":"تواصل معنا","phone":"0558232644","whatsappNumber":"0558232644","coverageText":"نخدم جميع مناطق المملكة","hoursText":"يتم تحديد ساعات العمل لاحقًا"}'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS technicians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zone TEXT NOT NULL,
  coverage_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT NOT NULL DEFAULT '',
  excel_technician_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_excel_technician_code
  ON technicians(excel_technician_code)
  WHERE TRIM(excel_technician_code) != '';

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

-- Recreate notifications to keep the local bootstrap compatible with older dev databases
-- that were created before `target_role` existed.
DROP TABLE IF EXISTS notifications;

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'info',
  related_order_id INTEGER,
  target_role TEXT NOT NULL DEFAULT '',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);

CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL DEFAULT 'Excel',
  status TEXT NOT NULL DEFAULT 'pending',
  orders_json TEXT NOT NULL DEFAULT '[]',
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  archived_count INTEGER NOT NULL DEFAULT 0,
  restored_count INTEGER NOT NULL DEFAULT 0,
  unchanged_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  skipped_orders_json TEXT NOT NULL DEFAULT '[]',
  last_error TEXT NOT NULL DEFAULT '',
  created_by_user_id INTEGER,
  created_by_role TEXT NOT NULL DEFAULT '',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_created_by_user_id ON import_jobs(created_by_user_id);

CREATE TABLE IF NOT EXISTS import_previews (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL DEFAULT 'Excel',
  orders_json TEXT NOT NULL DEFAULT '[]',
  created_by_user_id INTEGER,
  created_by_role TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_previews_created_by_user_id ON import_previews(created_by_user_id);

CREATE TABLE IF NOT EXISTS import_job_chunks (
  job_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  orders_json TEXT NOT NULL DEFAULT '[]',
  processed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (job_id, chunk_index),
  FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_job_chunks_job_id_processed_at
  ON import_job_chunks(job_id, processed_at, chunk_index);

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('كميل', 'komeil9610@gmail.com', '7dab4dea5da16f55d1a3d4c907663b895607204804a524d2420b908b7b1f63e2', 'admin', 'active'),
  ('مدير العمليات', 'kumeelalnahab@gmail.com', '8ee203584d62b70119e28b84475895c84801fa9ab53a7dab94776834925a6081', 'operations_manager', 'active'),
  ('رافع الإكسل', 'excel.upload@tarkeebpro.internal', 'e8cad7e8fcb949ba9d0d9d909acd410f03cc5d3d8abfa3fda20e9f80dcdcbbe3', 'excel_uploader', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

DELETE FROM user_workspace_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'komeil9610@gmail.com')
  AND role != 'admin';

DELETE FROM user_workspace_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'kumeelalnahab@gmail.com')
  AND role != 'operations_manager';

DELETE FROM user_workspace_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'excel.upload@tarkeebpro.internal')
  AND role != 'excel_uploader';

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'komeil9610@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'operations_manager'
FROM users
WHERE email = 'kumeelalnahab@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'excel_uploader'
FROM users
WHERE email = 'excel.upload@tarkeebpro.internal'
ON CONFLICT(user_id, role) DO NOTHING;

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
