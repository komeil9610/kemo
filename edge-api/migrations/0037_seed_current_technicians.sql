INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('Mohsin', 'mohsin@tarkeebpro.internal', '9814f7eb555dcdeae8b48ef79b3fa89d7f3b1be2377177035092f4db09749e2a', 'technician', 'active'),
  ('Ghulam', 'ghulam@tarkeebpro.internal', 'c4b460fe9fe873a12fdaf0594b859559a43ee462fdb104a91872d2173751c677', 'technician', 'active'),
  ('Rashid', 'rashid@tarkeebpro.internal', '03ebdfa4d0db27b5b580286c3c128c89f0505c9ab8059cfc48150a78998772f4', 'technician', 'active'),
  ('Ali', 'ali@tarkeebpro.internal', 'f7c6bde98c61e6ebf03c6e3b41c06478d017c317aa2cfba76d9a2f93b5cf66b6', 'technician', 'active'),
  ('Sajed', 'sajed@tarkeebpro.internal', 'e843647500050054a3ab47778c2633f3584061ef505b652f4c65c97185bccb72', 'technician', 'active'),
  ('Waseem', 'waseem@tarkeebpro.internal', 'f9e26175336c5fddbd60fc7b54a02794c1c8df525305d21bb3af0f966387844e', 'technician', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

DELETE FROM user_workspace_roles
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE email IN (
    'mohsin@tarkeebpro.internal',
    'ghulam@tarkeebpro.internal',
    'rashid@tarkeebpro.internal',
    'ali@tarkeebpro.internal',
    'sajed@tarkeebpro.internal',
    'waseem@tarkeebpro.internal'
  )
);

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'technician'
FROM users
WHERE email IN (
  'mohsin@tarkeebpro.internal',
  'ghulam@tarkeebpro.internal',
  'rashid@tarkeebpro.internal',
  'ali@tarkeebpro.internal',
  'sajed@tarkeebpro.internal',
  'waseem@tarkeebpro.internal'
)
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Mohsin', '0500000001', 'central', '["central","east","west","south"]', 'available', 'Technician account with multi-region coverage', 'M'
FROM users
WHERE email = 'mohsin@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Ghulam', '0500000002', 'east', '["east","central","west","south"]', 'available', 'Technician account with multi-region coverage', 'G'
FROM users
WHERE email = 'ghulam@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Rashid', '0500000003', 'west', '["west","central","east","south"]', 'available', 'Technician account with multi-region coverage', 'R'
FROM users
WHERE email = 'rashid@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Ali', '0500000004', 'east', '["east","west","central","south"]', 'available', 'Technician account with multi-region coverage', 'A'
FROM users
WHERE email = 'ali@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Sajed', '0500000005', 'south', '["south","west","central","east"]', 'available', 'Technician account with multi-region coverage', 'S'
FROM users
WHERE email = 'sajed@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;

INSERT INTO technicians (user_id, name, phone, zone, coverage_json, status, notes, excel_technician_code)
SELECT id, 'Waseem', '0500000006', 'east', '["east","west","central","south"]', 'available', 'Technician account with multi-region coverage', 'W'
FROM users
WHERE email = 'waseem@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  coverage_json = excluded.coverage_json,
  status = excluded.status,
  notes = excluded.notes,
  excel_technician_code = excluded.excel_technician_code;
