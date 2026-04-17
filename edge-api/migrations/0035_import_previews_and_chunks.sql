CREATE TABLE IF NOT EXISTS import_previews (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL DEFAULT 'Excel',
  orders_json TEXT NOT NULL DEFAULT '[]',
  created_by_user_id INTEGER,
  created_by_role TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_import_previews_created_by_user_id ON import_previews(created_by_user_id);

CREATE TABLE IF NOT EXISTS import_job_chunks (
  job_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  orders_json TEXT NOT NULL DEFAULT '[]',
  processed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (job_id, chunk_index),
  FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_import_job_chunks_job_id_processed_at
  ON import_job_chunks(job_id, processed_at, chunk_index);
