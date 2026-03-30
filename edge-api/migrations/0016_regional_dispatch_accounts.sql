PRAGMA foreign_keys = ON;

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('مستلم المنطقة الشرقية', 'east@tarkeebpro.sa', 'bce61ad03e923ef84077009a1ded8838f8fae00f6b653a296d3e44b789387f94', 'regional_dispatcher', 'active'),
  ('مستلم المنطقة الغربية', 'west@tarkeebpro.sa', '4b142ecdcbd35d90ec04e5f0ef24c5f19d45fd567c8c9d922979f369c11f2894', 'regional_dispatcher', 'active'),
  ('مستلم المنطقة الجنوبية', 'south@tarkeebpro.sa', '8dd442bbbeef93606e6b0a41d5b5cc768cddf60304c49547982fefe77cb6fac0', 'regional_dispatcher', 'active'),
  ('مستلم المنطقة الوسطى', 'central@tarkeebpro.sa', '45c89e16cbb3d31f52ce9ac63f75a9dc2f7eb1ff7a8f21bcc6a58601b773a064', 'regional_dispatcher', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'مستلم المنطقة الشرقية', '+966500010001', 'east', 'available', 'حساب إقليمي لاستلام طلبات المنطقة الشرقية من مدير العمليات'
FROM users
WHERE email = 'east@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'مستلم المنطقة الغربية', '+966500010002', 'west', 'available', 'حساب إقليمي لاستلام طلبات المنطقة الغربية من مدير العمليات'
FROM users
WHERE email = 'west@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'مستلم المنطقة الجنوبية', '+966500010003', 'south', 'available', 'حساب إقليمي لاستلام طلبات المنطقة الجنوبية من مدير العمليات'
FROM users
WHERE email = 'south@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'مستلم المنطقة الوسطى', '+966500010004', 'central', 'available', 'حساب إقليمي لاستلام طلبات المنطقة الوسطى من مدير العمليات'
FROM users
WHERE email = 'central@tarkeebpro.sa'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;
