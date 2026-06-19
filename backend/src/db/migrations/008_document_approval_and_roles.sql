-- Rename legacy USER role to EMPLOYEE and support BRANCH_MANAGER.
UPDATE users SET role = 'EMPLOYEE' WHERE role = 'USER';

ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'EMPLOYEE';

-- Document review workflow columns.
ALTER TABLE account_opening_documents
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_remarks TEXT;

ALTER TABLE account_opening_documents
  DROP CONSTRAINT IF EXISTS account_opening_documents_status_check;

ALTER TABLE account_opening_documents
  ADD CONSTRAINT account_opening_documents_status_check
  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

CREATE INDEX IF NOT EXISTS idx_account_opening_documents_branch_status
  ON account_opening_documents (branch_id, status);

CREATE INDEX IF NOT EXISTS idx_account_opening_documents_uploaded_by
  ON account_opening_documents (uploaded_by);

CREATE TABLE IF NOT EXISTS document_review_history (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES account_opening_documents(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  performed_by INTEGER NOT NULL REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT document_review_history_action_check
    CHECK (action IN ('APPROVED', 'REJECTED', 'RESUBMITTED'))
);

CREATE INDEX IF NOT EXISTS idx_document_review_history_document_id
  ON document_review_history (document_id, created_at DESC);
