INSERT INTO footer_settings (
  id,
  about_text,
  useful_links_json,
  customer_service_links_json,
  social_links_json,
  copyright_text,
  updated_at
)
VALUES (
  1,
  'تركيب برو لخدمات تركيب وصيانة المكيفات بخبرة عالية، سرعة في الوصول، وضمان على جودة العمل.',
  '[{"label":"Home","url":"/"},{"label":"Login","url":"/login"}]',
  '[{"label":"Support","url":"tel:0551153304"},{"label":"WhatsApp","url":"https://wa.me/966551153304"},{"label":"Call us","url":"tel:0551153304"}]',
  '[{"platform":"whatsapp","url":"https://wa.me/966551153304"}]',
  '© 2026 TrkeebPro',
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  about_text = excluded.about_text,
  useful_links_json = excluded.useful_links_json,
  customer_service_links_json = excluded.customer_service_links_json,
  social_links_json = excluded.social_links_json,
  copyright_text = excluded.copyright_text,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO home_settings (
  id,
  hero_kicker,
  hero_title,
  hero_subtitle,
  primary_button_text,
  primary_button_url,
  secondary_button_text,
  secondary_button_url,
  stats_json,
  updated_at
)
VALUES (
  1,
  'تركيب برو',
  'تركيب وصيانة المكيفات باحترافية عالية',
  'خدمة سريعة | أسعار منافسة | ضمان على العمل',
  'احجز الآن',
  '#contact',
  'تواصل عبر واتساب',
  'https://wa.me/966551153304',
  '{"contentVersion":2,"heroNote":"متخصصون في تركيب وصيانة جميع أنواع المكيفات بخبرة عالية وفريق فني محترف، مع اهتمام بالتفاصيل وسرعة في التنفيذ.","heroHighlights":["خدمة سريعة","أسعار منافسة","ضمان على العمل"],"stats":[{"value":"6","label":"خدمات رئيسية"},{"value":"24/7","label":"استجابة سريعة"},{"value":"100%","label":"اهتمام بالنظافة والجودة"}],"aboutTitle":"من نحن","aboutText":"نحن في \"تركيب برو\" متخصصون في تركيب وصيانة جميع أنواع المكيفات، بخبرة عالية وفريق فني محترف. نضمن لك جودة العمل وسرعة التنفيذ بأفضل الأسعار.","servicesTitle":"خدماتنا","services":["تركيب مكيفات سبليت","تركيب مكيفات شباك","فك ونقل المكيفات","صيانة وتنظيف المكيفات","تعبئة فريون","كشف الأعطال"],"featuresTitle":"لماذا تختارنا؟","features":["فنيين محترفين","سرعة في الوصول","أسعار مناسبة","ضمان على الخدمة","خدمة عملاء ممتازة"],"galleryTitle":"أعمالنا","galleryImages":[{"title":"تركيب احترافي","caption":"تنفيذ مرتب واهتمام كامل بالتفاصيل وجودة التشطيب.","imageUrl":"/home-gallery-1.jpg"},{"title":"خدمة ميدانية سريعة","caption":"وصول سريع وتجهيز كامل لخدمة جميع أنواع المكيفات.","imageUrl":"/home-gallery-2.webp"},{"title":"صيانة وتنظيف","caption":"حلول صيانة وتنظيف تعيد كفاءة التبريد وتحافظ على عمر الجهاز.","imageUrl":"/home-gallery-3.jpg"}],"testimonialsTitle":"آراء العملاء","testimonials":["خدمة ممتازة وسريعة، أنصح فيهم","أسعارهم مناسبة وشغلهم نظيف"],"contactTitle":"تواصل معنا","phone":"0551153304","whatsappNumber":"0551153304","coverageText":"نخدم جميع مناطق المملكة","hoursText":"يتم تحديد ساعات العمل لاحقًا"}',
  CURRENT_TIMESTAMP
)
ON CONFLICT(id) DO UPDATE SET
  hero_kicker = excluded.hero_kicker,
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  primary_button_text = excluded.primary_button_text,
  primary_button_url = excluded.primary_button_url,
  secondary_button_text = excluded.secondary_button_text,
  secondary_button_url = excluded.secondary_button_url,
  stats_json = excluded.stats_json,
  updated_at = CURRENT_TIMESTAMP;
