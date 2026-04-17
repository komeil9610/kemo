PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_workspace_roles (
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_workspace_roles_role ON user_workspace_roles(role);

ALTER TABLE notifications ADD COLUMN target_role TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);

DELETE FROM user_workspace_roles
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE role IN ('customer_service', 'operations_manager')
     OR email = 'bobmorgann2@gmail.com'
);

DELETE FROM users
WHERE role IN ('customer_service', 'operations_manager')
  AND email != 'bobmorgann2@gmail.com';

INSERT INTO users (name, email, password_hash, role, status)
VALUES ('كميل', 'bobmorgann2@gmail.com', '229736ba52217be12f8df873c543fe7919be6a85d5097eb2b320c3b8a6ce2d74', 'operations_manager', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'operations_manager'
FROM users
WHERE email = 'bobmorgann2@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'customer_service'
FROM users
WHERE email = 'bobmorgann2@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;
