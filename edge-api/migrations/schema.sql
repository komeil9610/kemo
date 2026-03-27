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
  about_text TEXT NOT NULL DEFAULT 'Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
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
  'Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  '[{"label":"الرئيسية","url":"/"},{"label":"المنتجات","url":"/products"},{"label":"طلباتي","url":"/orders"}]',
  '[{"label":"الدعم الفني","url":"mailto:support@rentit.app"},{"label":"واتساب","url":"https://wa.me/966500000000"},{"label":"الأسئلة الشائعة","url":"/products"}]',
  '[{"platform":"instagram","url":"https://instagram.com/rentit.app"},{"platform":"x","url":"https://x.com/rentitapp"},{"platform":"linkedin","url":"https://linkedin.com/company/rentit"}]',
  'جميع الحقوق محفوظة لكميل'
)
ON CONFLICT(id) DO NOTHING;

CREATE TABLE IF NOT EXISTS home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_kicker TEXT NOT NULL DEFAULT 'RentIT Marketplace',
  hero_title TEXT NOT NULL DEFAULT 'Rent smarter. Own less. Do more.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Discover verified rentals for devices, costumes, and services across Saudi Arabia.',
  primary_button_text TEXT NOT NULL DEFAULT 'Browse Products',
  primary_button_url TEXT NOT NULL DEFAULT '/products',
  secondary_button_text TEXT NOT NULL DEFAULT 'Get Started',
  secondary_button_url TEXT NOT NULL DEFAULT '/register',
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
  'RentIT Marketplace',
  'Rent smarter. Own less. Do more.',
  'Discover verified rentals for devices, costumes, and services across Saudi Arabia.',
  'Browse Products',
  '/products',
  'Get Started',
  '/register',
  '[{"value":"10K+","label":"Trusted Users"},{"value":"4.9/5","label":"Average Rating"},{"value":"35+","label":"Cities Covered"}]'
)
ON CONFLICT(id) DO NOTHING;
