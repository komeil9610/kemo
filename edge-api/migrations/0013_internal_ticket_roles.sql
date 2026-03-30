-- Intentionally avoids seeding fixed credentials.
-- Provision real customer service and operations manager accounts separately.

UPDATE users
SET
  name = CASE WHEN TRIM(COALESCE(name, '')) = '' THEN 'Customer Service' ELSE name END,
  status = 'active'
WHERE role = 'customer_service';

UPDATE users
SET
  name = CASE WHEN TRIM(COALESCE(name, '')) = '' THEN 'Operations Manager' ELSE name END,
  status = 'active'
WHERE role = 'operations_manager';
