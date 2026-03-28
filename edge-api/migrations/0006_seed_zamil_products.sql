INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity)
SELECT
  NULL,
  'مكيف شباك الزامل 18000 وحدة مع تركيب',
  'مكيف شباك من الزامل مناسب للغرف والملاحق، يشمل خدمة التركيب الأساسية وزيارة فنية للتأكد من الجاهزية.',
  'device',
  'الرياض',
  95,
  4.8,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
  6
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'مكيف شباك الزامل 18000 وحدة مع تركيب'
);

INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity)
SELECT
  NULL,
  'مكيف شباك الزامل 18000 وحدة بدون تركيب',
  'نفس مكيف الزامل بحالة ممتازة للتأجير اليومي أو الأسبوعي بدون خدمة تركيب، مناسب لمن لديه فني خاص أو تركيب جاهز.',
  'device',
  'الرياض',
  75,
  4.7,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
  8
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'مكيف شباك الزامل 18000 وحدة بدون تركيب'
);

INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity)
SELECT
  NULL,
  'مكيف سبليت الزامل 24000 وحدة مع تركيب',
  'مكيف سبليت الزامل بقدرة تبريد عالية للمجالس والغرف الكبيرة، شامل فكرتون وتركيب وتشغيل أولي.',
  'device',
  'الرياض',
  140,
  4.9,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'مكيف سبليت الزامل 24000 وحدة مع تركيب'
);

INSERT INTO products (owner_user_id, name, description, category, city, price_per_day, rating, image_url, quantity)
SELECT
  NULL,
  'مكيف سبليت الزامل 24000 وحدة بدون تركيب',
  'مكيف سبليت الزامل جاهز للتوريد فقط بدون خدمة تركيب، مناسب للمشاريع أو العملاء الذين يديرون التركيب داخليًا.',
  'device',
  'الرياض',
  115,
  4.8,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
  5
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'مكيف سبليت الزامل 24000 وحدة بدون تركيب'
);
