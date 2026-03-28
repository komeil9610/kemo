CREATE TABLE IF NOT EXISTS footer_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  about_text TEXT NOT NULL DEFAULT 'تركيب برو منصة موثوقة لإدارة خدمات التكييف والتركيب بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
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
  'تركيب برو منصة موثوقة لإدارة خدمات التكييف والتركيب بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  '[{"label":"الرئيسية","url":"/"},{"label":"الطلبات","url":"/orders"},{"label":"لوحة الإدارة","url":"/dashboard"}]',
  '[{"label":"الدعم الفني","url":"mailto:ops@tarkeebpro.sa"},{"label":"واتساب","url":"https://wa.me/966500000000"},{"label":"التواصل","url":"/"}]',
  '[{"platform":"instagram","url":"https://instagram.com/tarkeebpro"},{"platform":"x","url":"https://x.com/tarkeebpro"},{"platform":"linkedin","url":"https://linkedin.com/company/tarkeebpro"}]',
  'جميع الحقوق محفوظة لكميل'
)
ON CONFLICT(id) DO NOTHING;
