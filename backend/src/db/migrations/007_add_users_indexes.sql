-- Indexes to support internal user listing, filtering, and login lookups.

CREATE INDEX IF NOT EXISTS idx_users_created_at_id
  ON users (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_users_branch_id
  ON users (branch_id);

CREATE INDEX IF NOT EXISTS idx_users_is_active
  ON users (is_active);

CREATE INDEX IF NOT EXISTS idx_users_email_lower
  ON users (LOWER(email));
