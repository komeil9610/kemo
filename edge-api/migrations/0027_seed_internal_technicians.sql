PRAGMA foreign_keys = ON;

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('W-J', 'bobmorgann1@gmail.com', '014fb23ca400e9b781a4c7d58819afd151a09868810ce87c4f3b488ea957ace0', 'technician', 'active'),
  ('D-M', 'bobmorgann112@gmail.com', 'cb9c523529ce2100b9824ba6056e2c6e52d80a14731efd3faba420bc93714ddf', 'technician', 'active'),
  ('H-R', 'komeil9060@gmail.com', '65372a102dacefd81cc5d1a3cb826a9126b61407e5b81fda1699b6e54403365f', 'technician', 'active'),
  ('R-A', 'r-a@tarkeebpro.internal', '1e68512df903d3ec75cfd23c8e7e474aadbdedfdca814b1e27cd14acd953ff1f', 'technician', 'active'),
  ('H-G', 'h-g@tarkeebpro.internal', 'dfaf35533790e6dbf229106b6f2882e0d5f084c26adbf634860ed1990ead11bb', 'technician', 'active'),
  ('A-D', 'a-d@tarkeebpro.internal', 'a31fb640923267e4dfde4887b4a4df251bf4d1627a4627fbe39f130ef6d41299', 'technician', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'W-J', '0500000001', 'east', 'available', 'الفني W-J'
FROM users
WHERE email = 'bobmorgann1@gmail.com'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'D-M', '0500000002', 'east', 'available', 'الفني D-M'
FROM users
WHERE email = 'bobmorgann112@gmail.com'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'H-R', '0500000003', 'west', 'available', 'الفني H-R'
FROM users
WHERE email = 'komeil9060@gmail.com'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'R-A', '0500000004', 'central', 'available', 'الفني R-A'
FROM users
WHERE email = 'r-a@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'H-G', '0500000005', 'south', 'available', 'الفني H-G'
FROM users
WHERE email = 'h-g@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;

INSERT INTO technicians (user_id, name, phone, zone, status, notes)
SELECT id, 'A-D', '0500000006', 'central', 'available', 'الفني A-D'
FROM users
WHERE email = 'a-d@tarkeebpro.internal'
ON CONFLICT(user_id) DO UPDATE SET
  name = excluded.name,
  phone = excluded.phone,
  zone = excluded.zone,
  status = excluded.status,
  notes = excluded.notes;
