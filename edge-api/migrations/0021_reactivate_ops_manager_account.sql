INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'مدير العمليات',
  'operations@tarkeebpro.sa',
  '7c31f434dcc0dfe876cdb3be7905406e0b0ea8a73e91e0ee48f4f855730e23fe',
  'operations_manager',
  'active'
)
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = 'active';
