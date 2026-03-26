PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE products ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
