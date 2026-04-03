PRAGMA foreign_keys = ON;

DELETE FROM notifications;
DELETE FROM push_subscriptions;
DELETE FROM technicians;
DELETE FROM users
WHERE role IN ('admin', 'technician', 'customer_service', 'operations_manager');

INSERT INTO users (name, email, password_hash, role, status)
VALUES
  ('خدمة العملاء', 'customer-service@tarkeebpro.sa', '70b4b3f2bbc28083db439cac1d94b3d85d41a3e5135faadc45deee8ff6974a29', 'customer_service', 'active'),
  ('مدير العمليات', 'operations@tarkeebpro.sa', '7c31f434dcc0dfe876cdb3be7905406e0b0ea8a73e91e0ee48f4f855730e23fe', 'operations_manager', 'active');

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
