CREATE TABLE IF NOT EXISTS operation_training_materials (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size >= 0),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS operation_training_materials_created_at_idx
  ON operation_training_materials (created_at DESC);

CREATE INDEX IF NOT EXISTS operation_training_materials_search_title_idx
  ON operation_training_materials (title);
