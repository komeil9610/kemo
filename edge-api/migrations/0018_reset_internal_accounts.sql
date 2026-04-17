PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_workspace_roles (
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DELETE FROM notifications;
DELETE FROM push_subscriptions;
DELETE FROM technicians;
DELETE FROM user_workspace_roles;
DELETE FROM users
WHERE role IN ('admin', 'technician', 'customer_service', 'operations_manager');

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('كميل', 'bobmorgann2@gmail.com', '229736ba52217be12f8df873c543fe7919be6a85d5097eb2b320c3b8a6ce2d74', 'operations_manager', 'active');

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

UPDATE home_settings
SET hero_title = 'Manage customer service and operations from one internal system.',
    hero_subtitle = 'Separate workspaces for customer service and the operations manager only.',
    primary_button_text = 'Sign in',
    primary_button_url = '/login',
    secondary_button_text = 'Open login',
    secondary_button_url = '/login',
    stats_json = '[{"value":"2","label":"Core roles"},{"value":"1","label":"Unified internal workflow"},{"value":"1","label":"Separated operations system"}]',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE footer_settings
SET about_text = 'مساحة داخلية مبسطة لخدمة العملاء ومدير العمليات فقط.',
    useful_links_json = '[{"label":"الرئيسية","url":"/"},{"label":"تسجيل الدخول","url":"/login"}]',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
