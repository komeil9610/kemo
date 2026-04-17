create table if not exists public.zamil_orders (
  tracking_key text primary key,
  id_ref text not null default '',
  wo_id text not null default '',
  so_id text not null default '',
  customer text not null default '',
  phone text not null default '',
  shipping_city text not null default '',
  shipping_address text not null default '',
  installation_date date,
  status text not null default '',
  bundled_items integer not null default 0,
  device_count integer not null default 0,
  ready_for_pickup boolean not null default false,
  source_file text not null default '',
  row_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_zamil_orders_installation_date
  on public.zamil_orders(installation_date);

create index if not exists idx_zamil_orders_status
  on public.zamil_orders(status);

create index if not exists idx_zamil_orders_wo_id
  on public.zamil_orders(wo_id);

create index if not exists idx_zamil_orders_so_id
  on public.zamil_orders(so_id);
