create table if not exists public.users (
  id bigint primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);

create table if not exists public.products (
  id bigint primary key,
  owner_user_id bigint references public.users(id) on delete set null,
  name text not null,
  description text not null,
  category text not null default 'device',
  city text not null default 'Riyadh',
  price_per_day numeric not null default 0,
  rating numeric not null default 0,
  image_url text,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_city on public.products(city);

create table if not exists public.bookings (
  id bigint primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  start_date text not null,
  end_date text not null,
  quantity integer not null default 1,
  total_price numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_product_id on public.bookings(product_id);
create index if not exists idx_bookings_status on public.bookings(status);

create table if not exists public.footer_settings (
  id bigint primary key,
  about_text text not null default 'Tarkeeb Pro منصة موثوقة لإدارة طلبات التركيب والفنيين بسهولة واحترافية، مع تجربة استخدام مرنة ودعم سريع للعملاء.',
  useful_links_json text not null default '[]',
  customer_service_links_json text not null default '[]',
  social_links_json text not null default '[]',
  copyright_text text not null default 'جميع الحقوق محفوظة لكميل',
  updated_at timestamptz not null default now(),
  constraint footer_settings_singleton check (id = 1)
);

create table if not exists public.home_settings (
  id bigint primary key,
  hero_kicker text not null default 'Tarkeeb Pro Operations',
  hero_title text not null default 'Manage customer service and operations from one internal system.',
  hero_subtitle text not null default 'Dedicated workspaces for customer service and the operations manager.',
  primary_button_text text not null default 'Sign in',
  primary_button_url text not null default '/login',
  secondary_button_text text not null default 'Open login',
  secondary_button_url text not null default '/login',
  stats_json text not null default '[]',
  updated_at timestamptz not null default now(),
  constraint home_settings_singleton check (id = 1)
);

create table if not exists public.technicians (
  id bigint primary key,
  user_id bigint not null unique references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  zone text not null,
  status text not null default 'available',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_technicians_status on public.technicians(status);

create table if not exists public.service_time_standards (
  standard_key text primary key,
  label text not null,
  ar_label text not null,
  duration_minutes integer not null default 60,
  sort_order integer not null default 1
);

create table if not exists public.internal_area_clusters (
  id bigint primary key,
  city text not null,
  district text not null,
  area_key text not null,
  label text not null,
  ar_label text not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city, district)
);

create table if not exists public.service_orders (
  id bigint primary key,
  customer_name text not null,
  request_number text not null default '',
  phone text not null,
  secondary_phone text not null default '',
  whatsapp_phone text not null default '',
  district text not null default '',
  city text not null default '',
  address text not null,
  address_text text not null default '',
  landmark text not null default '',
  map_link text not null default '',
  ac_type text not null,
  service_category text not null default 'split_installation',
  standard_duration_minutes integer not null default 120,
  work_started_at text,
  completion_note text not null default '',
  delay_reason text not null default '',
  delay_note text not null default '',
  work_type text not null default '',
  ac_count integer not null default 1,
  status text not null default 'pending',
  priority text not null default 'normal',
  delivery_type text not null default 'none',
  preferred_date text not null default '',
  preferred_time text not null default '',
  scheduled_date text not null,
  scheduled_time text not null default '',
  coordination_note text not null default '',
  source text not null default 'manual',
  notes text not null default '',
  customer_action text not null default 'none',
  reschedule_reason text not null default '',
  cancellation_reason text not null default '',
  canceled_at text,
  completed_at text,
  approval_status text not null default 'pending',
  proof_status text not null default 'pending_review',
  approved_at text,
  approved_by text not null default '',
  client_signature text not null default '',
  zamil_closure_status text not null default 'idle',
  zamil_close_requested_at text,
  zamil_otp_code text not null default '',
  zamil_otp_submitted_at text,
  zamil_closed_at text,
  suspension_reason text not null default '',
  suspension_note text not null default '',
  suspended_at text,
  exception_status text not null default 'none',
  audit_log_json text not null default '[]',
  technician_id bigint references public.technicians(id) on delete set null,
  copper_meters numeric not null default 0,
  base_included integer not null default 0,
  extras_total numeric not null default 0,
  service_items_json text not null default '[]',
  created_by_user_id bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_service_orders_status on public.service_orders(status);
create index if not exists idx_service_orders_technician_id on public.service_orders(technician_id);

create table if not exists public.service_order_photos (
  id bigint primary key,
  order_id bigint not null references public.service_orders(id) on delete cascade,
  image_name text not null,
  image_url text not null,
  uploaded_by_user_id bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_order_photos_order_id on public.service_order_photos(order_id);

create table if not exists public.notifications (
  id bigint primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info',
  related_order_id bigint references public.service_orders(id) on delete cascade,
  is_read integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

create table if not exists public.push_subscriptions (
  id bigint primary key,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id bigint references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_users (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_products (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_bookings (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_payments (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_reviews (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_service_orders (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);

create table if not exists public.legacy_mongo_subscriptions (
  mongo_id text primary key,
  payload jsonb not null,
  synced_at timestamptz not null default now()
);
