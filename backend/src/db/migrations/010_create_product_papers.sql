CREATE TABLE IF NOT EXISTS product_papers (
  id SERIAL PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('DEPOSIT', 'CREDIT')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size >= 0),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_papers_category_idx
  ON product_papers (category);

CREATE INDEX IF NOT EXISTS product_papers_created_at_idx
  ON product_papers (created_at DESC);

CREATE INDEX IF NOT EXISTS product_papers_search_title_idx
  ON product_papers (title);
