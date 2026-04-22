INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('كميل', 'komeil9610@gmail.com', '7dab4dea5da16f55d1a3d4c907663b895607204804a524d2420b908b7b1f63e2', 'admin', 'active'),
  ('مدير العمليات', 'kumeelalnahab@gmail.com', '8ee203584d62b70119e28b84475895c84801fa9ab53a7dab94776834925a6081', 'operations_manager', 'active'),
  ('Mohsin', 'mohsin@tarkeebpro.internal', '06803b4c67f8c93e50e81dfb40a56379864b6e30364c1831d2403d7bbb49e5cc', 'technician', 'active'),
  ('Ghulam', 'ghulam@tarkeebpro.internal', 'ba89d8203bf127a016f4364f32566c18da5180d8b6478b9537eced324e8a74cf', 'technician', 'active'),
  ('Rashid', 'rashid@tarkeebpro.internal', 'cc60ec4d4f7770de03eecf8e2013a6329a2d9019fb3dee955da23ebf9fc98d7e', 'technician', 'active'),
  ('Ali', 'ali@tarkeebpro.internal', 'e3df2d4c1bf56ef869ca385ab6f4227fe4caa988e352167bd5f334a6bb44a0b0', 'technician', 'active'),
  ('Sajed', 'sajed@tarkeebpro.internal', '6e02b25e29519e9e80ae34dcc8b0f379d1b9a2aa1226a60d14d12f36b667b4c0', 'technician', 'active'),
  ('Waseem', 'waseem@tarkeebpro.internal', '0d296e728d2949dcf9bf65e2f1248472def9ccfc934c1e3f543b68187bde12fd', 'technician', 'active')
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
    'komeil9610@gmail.com',
    'kumeelalnahab@gmail.com',
    'mohsin@tarkeebpro.internal',
    'ghulam@tarkeebpro.internal',
    'rashid@tarkeebpro.internal',
    'ali@tarkeebpro.internal',
    'sajed@tarkeebpro.internal',
    'waseem@tarkeebpro.internal'
  )
);

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, role
FROM users
WHERE email IN (
  'komeil9610@gmail.com',
  'kumeelalnahab@gmail.com',
  'mohsin@tarkeebpro.internal',
  'ghulam@tarkeebpro.internal',
  'rashid@tarkeebpro.internal',
  'ali@tarkeebpro.internal',
  'sajed@tarkeebpro.internal',
  'waseem@tarkeebpro.internal'
)
ON CONFLICT(user_id, role) DO NOTHING;
