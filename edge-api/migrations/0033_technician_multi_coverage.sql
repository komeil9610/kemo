ALTER TABLE technicians ADD COLUMN coverage_json TEXT NOT NULL DEFAULT '[]';

UPDATE technicians
SET coverage_json = CASE
  WHEN TRIM(COALESCE(coverage_json, '')) = '' OR coverage_json = '[]' THEN json_array(zone)
  ELSE coverage_json
END;
