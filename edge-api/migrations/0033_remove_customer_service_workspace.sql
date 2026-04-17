DELETE FROM user_workspace_roles
WHERE role = 'customer_service';

UPDATE users
SET role = 'admin'
WHERE email = 'bobmorgann2@gmail.com'
  AND role = 'customer_service';
