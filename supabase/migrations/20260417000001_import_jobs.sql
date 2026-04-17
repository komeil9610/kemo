create table if not exists public.import_jobs (
  id text primary key,
  file_name text not null default 'Excel',
  status text not null default 'pending',
  total_rows integer not null default 0,
  processed_rows integer not null default 0,
  imported_count integer not null default 0,
  created_count integer not null default 0,
  updated_count integer not null default 0,
  archived_count integer not null default 0,
  restored_count integer not null default 0,
  unchanged_count integer not null default 0,
  skipped_count integer not null default 0,
  skipped_orders_json jsonb not null default '[]'::jsonb,
  last_error text not null default '',
  created_by_user_id bigint,
  created_by_role text not null default '',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_import_jobs_status
  on public.import_jobs(status);

create index if not exists idx_import_jobs_created_by_user_id
  on public.import_jobs(created_by_user_id);

create table if not exists public.import_previews (
  id text primary key,
  file_name text not null default 'Excel',
  orders_json jsonb not null default '[]'::jsonb,
  created_by_user_id bigint,
  created_by_role text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_import_previews_created_by_user_id
  on public.import_previews(created_by_user_id);

create table if not exists public.import_job_chunks (
  job_id text not null,
  chunk_index integer not null,
  row_count integer not null default 0,
  orders_json jsonb not null default '[]'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (job_id, chunk_index)
);

create index if not exists idx_import_job_chunks_job_id_processed_at
  on public.import_job_chunks(job_id, processed_at, chunk_index);
