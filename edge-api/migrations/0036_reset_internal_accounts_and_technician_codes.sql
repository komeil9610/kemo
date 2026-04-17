ALTER TABLE technicians ADD COLUMN excel_technician_code TEXT NOT NULL DEFAULT '';

UPDATE technicians
SET excel_technician_code = UPPER(TRIM(excel_technician_code))
WHERE TRIM(excel_technician_code) != '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_technicians_excel_technician_code
  ON technicians(excel_technician_code)
  WHERE TRIM(excel_technician_code) != '';

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('كميل', 'komeil9610@gmail.com', '7dab4dea5da16f55d1a3d4c907663b895607204804a524d2420b908b7b1f63e2', 'admin', 'active'),
  ('مدير العمليات', 'kumeelalnahab@gmail.com', '8ee203584d62b70119e28b84475895c84801fa9ab53a7dab94776834925a6081', 'operations_manager', 'active')
ON CONFLICT(email) DO UPDATE SET
  name = excluded.name,
  password_hash = excluded.password_hash,
  role = excluded.role,
  status = excluded.status;

UPDATE footer_settings
SET
  customer_service_links_json = '[{"label":"Support","url":"tel:0558232644"},{"label":"WhatsApp","url":"https://wa.me/966558232644"},{"label":"Call us","url":"tel:0558232644"}]',
  social_links_json = '[{"platform":"whatsapp","url":"https://wa.me/966558232644"}]',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE home_settings
SET
  secondary_button_url = 'https://wa.me/966558232644',
  stats_json = json_set(
    json_set(COALESCE(stats_json, '{}'), '$.phone', '0558232644'),
    '$.whatsappNumber',
    '0558232644'
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

UPDATE service_orders
SET technician_id = NULL
WHERE technician_id IN (SELECT id FROM technicians);

DELETE FROM technicians;

DELETE FROM user_workspace_roles
WHERE role = 'customer_service';

DELETE FROM user_workspace_roles
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE role IN ('admin', 'operations_manager', 'technician', 'customer_service')
    AND email NOT IN ('komeil9610@gmail.com', 'kumeelalnahab@gmail.com')
);

DELETE FROM users
WHERE role IN ('admin', 'operations_manager', 'technician', 'customer_service')
  AND email NOT IN ('komeil9610@gmail.com', 'kumeelalnahab@gmail.com');

DELETE FROM user_workspace_roles
WHERE user_id IN (
  SELECT id
  FROM users
  WHERE email IN ('komeil9610@gmail.com', 'kumeelalnahab@gmail.com')
);

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'admin'
FROM users
WHERE email = 'komeil9610@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

INSERT INTO user_workspace_roles (user_id, role)
SELECT id, 'operations_manager'
FROM users
WHERE email = 'kumeelalnahab@gmail.com'
ON CONFLICT(user_id, role) DO NOTHING;

UPDATE users
SET
  name = CASE
    WHEN email = 'komeil9610@gmail.com' THEN 'كميل'
    WHEN email = 'kumeelalnahab@gmail.com' THEN 'مدير العمليات'
    ELSE name
  END,
  role = CASE
    WHEN email = 'komeil9610@gmail.com' THEN 'admin'
    WHEN email = 'kumeelalnahab@gmail.com' THEN 'operations_manager'
    ELSE role
  END,
  status = 'active'
WHERE email IN ('komeil9610@gmail.com', 'kumeelalnahab@gmail.com');
