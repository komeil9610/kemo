PRAGMA foreign_keys = ON;

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('كميل', 'bobmorgann2@gmail.com', '229736ba52217be12f8df873c543fe7919be6a85d5097eb2b320c3b8a6ce2d74', 'customer_service', 'active'),
  ('مدير العمليات', 'tarkeebpro@gmail.com', 'b93774e2aac1f0ab87d56f366cb71f0294def963bf2e4711cd69ea1c500868ea', 'operations_manager', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

DELETE FROM user_workspace_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'bobmorgann2@gmail.com')
  AND role != 'customer_service';

DELETE FROM user_workspace_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'tarkeebpro@gmail.com')
  AND role != 'operations_manager';

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'customer_service'
FROM users
WHERE email = 'bobmorgann2@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'operations_manager'
FROM users
WHERE email = 'tarkeebpro@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;
