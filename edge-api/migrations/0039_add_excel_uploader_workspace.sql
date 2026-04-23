INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'رافع الإكسل',
  'excel.upload@tarkeebpro.internal',
  'e8cad7e8fcb949ba9d0d9d909acd410f03cc5d3d8abfa3fda20e9f80dcdcbbe3',
  'excel_uploader',
  'active'
)
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'excel_uploader'
FROM users
WHERE email = 'excel.upload@tarkeebpro.internal'
ON CONFLICT(user_id, role) DO NOTHING;
