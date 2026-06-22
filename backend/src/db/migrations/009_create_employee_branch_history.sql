CREATE TABLE IF NOT EXISTS employee_branch_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  old_branch_id INTEGER REFERENCES branches(id),
  new_branch_id INTEGER NOT NULL REFERENCES branches(id),
  transferred_by INTEGER NOT NULL REFERENCES users(id),
  remarks TEXT,
  transferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS employee_branch_history_user_id_idx
  ON employee_branch_history (user_id);

CREATE INDEX IF NOT EXISTS employee_branch_history_transferred_at_idx
  ON employee_branch_history (transferred_at DESC);
