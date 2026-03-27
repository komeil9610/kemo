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
