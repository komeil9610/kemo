CREATE TABLE IF NOT EXISTS home_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_kicker TEXT NOT NULL DEFAULT 'Tarkeeb Pro Operations',
  hero_title TEXT NOT NULL DEFAULT 'Manage installation orders with a clean official workflow.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Capture, assign, and complete AC installation jobs across Saudi Arabia in one place.',
  primary_button_text TEXT NOT NULL DEFAULT 'Open Dashboard',
  primary_button_url TEXT NOT NULL DEFAULT '/dashboard',
  secondary_button_text TEXT NOT NULL DEFAULT 'Open Technician View',
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
  'Manage installation orders with a clean official workflow.',
  'Capture, assign, and complete AC installation jobs across Saudi Arabia in one place.',
  'Open Dashboard',
  '/dashboard',
  'Open Technician View',
  '/tasks',
  '[{"value":"1","label":"Admin console"},{"value":"4","label":"Live order states"},{"value":"24/7","label":"Team readiness"}]'
)
ON CONFLICT(id) DO NOTHING;
