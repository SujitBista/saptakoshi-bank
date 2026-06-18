CREATE TABLE IF NOT EXISTS account_opening_documents (
  id BIGSERIAL PRIMARY KEY,
  branch_id INTEGER NOT NULL REFERENCES branches(id),
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  client_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  citizen_no VARCHAR(50) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  document_no VARCHAR(80) NOT NULL UNIQUE,
  original_file_name TEXT NOT NULL,
  stored_file_name TEXT NOT NULL,
  relative_file_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS account_opening_documents_branch_id_idx
  ON account_opening_documents (branch_id);

CREATE INDEX IF NOT EXISTS account_opening_documents_uploaded_by_idx
  ON account_opening_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS account_opening_documents_client_code_idx
  ON account_opening_documents (client_code);
