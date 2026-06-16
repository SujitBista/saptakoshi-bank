CREATE TABLE branches (
  id SERIAL PRIMARY KEY,
  branch_code VARCHAR(20) UNIQUE NOT NULL,
  branch_name VARCHAR(200) NOT NULL,
  address TEXT,
  phone_number VARCHAR(30),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_branch_code ON branches (branch_code);
CREATE INDEX idx_branches_branch_name ON branches (branch_name);
CREATE INDEX idx_branches_is_active ON branches (is_active);
