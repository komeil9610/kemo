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

ALTER TABLE service_orders ADD COLUMN service_category TEXT NOT NULL DEFAULT 'split_installation';
ALTER TABLE service_orders ADD COLUMN standard_duration_minutes INTEGER NOT NULL DEFAULT 120;
ALTER TABLE service_orders ADD COLUMN work_started_at TEXT;
ALTER TABLE service_orders ADD COLUMN completion_note TEXT NOT NULL DEFAULT '';
ALTER TABLE service_orders ADD COLUMN delay_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE service_orders ADD COLUMN delay_note TEXT NOT NULL DEFAULT '';
