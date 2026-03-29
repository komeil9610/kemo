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
