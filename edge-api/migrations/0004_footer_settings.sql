CREATE TABLE IF NOT EXISTS footer_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  about_text TEXT NOT NULL DEFAULT 'Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  useful_links_json TEXT NOT NULL DEFAULT '[]',
  customer_service_links_json TEXT NOT NULL DEFAULT '[]',
  social_links_json TEXT NOT NULL DEFAULT '[]',
  copyright_text TEXT NOT NULL DEFAULT 'جميع الحقوق محفوظة لكميل',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO footer_settings (
  id,
  about_text,
  useful_links_json,
  customer_service_links_json,
  social_links_json,
  copyright_text
)
VALUES (
  1,
  'Rent It منصة موثوقة لتأجير المنتجات والخدمات بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  '[{"label":"الرئيسية","url":"/"},{"label":"المنتجات","url":"/products"},{"label":"طلباتي","url":"/orders"}]',
  '[{"label":"الدعم الفني","url":"mailto:support@rentit.app"},{"label":"واتساب","url":"https://wa.me/966500000000"},{"label":"الأسئلة الشائعة","url":"/products"}]',
  '[{"platform":"instagram","url":"https://instagram.com/rentit.app"},{"platform":"x","url":"https://x.com/rentitapp"},{"platform":"linkedin","url":"https://linkedin.com/company/rentit"}]',
  'جميع الحقوق محفوظة لكميل'
)
ON CONFLICT(id) DO NOTHING;
