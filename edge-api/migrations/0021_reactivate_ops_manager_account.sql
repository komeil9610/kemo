INSERT INTO users (name, email, password_hash, role, status)
VALUES (
  'كميل',
  'bobmorgann2@gmail.com',
  '229736ba52217be12f8df873c543fe7919be6a85d5097eb2b320c3b8a6ce2d74',
  'operations_manager',
  'active'
)
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = 'active';

CREATE TABLE IF NOT EXISTS user_workspace_roles (
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'operations_manager'
FROM users
WHERE email = 'bobmorgann2@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;
