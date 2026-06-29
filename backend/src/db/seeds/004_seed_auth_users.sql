INSERT INTO users (full_name, username, email, password_hash, role, branch_id, is_active)
VALUES (
  'Ram Sharma',
  'ram',
  'ram@saptakoshi.com',
  '$2b$10$dNrq3jyfwkzQrjTC.Xijyu8WzuLMnhiYa/NTsl9xKtWjpjLHFEWey',
  'MAKER',
  (SELECT id FROM branches WHERE branch_code = 'BRT001'),
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_active = EXCLUDED.is_active;

INSERT INTO users (full_name, username, email, password_hash, role, branch_id, is_active)
VALUES (
  'Inactive User',
  'inactive',
  'inactive@saptakoshi.com',
  '$2b$10$dNrq3jyfwkzQrjTC.Xijyu8WzuLMnhiYa/NTsl9xKtWjpjLHFEWey',
  'MAKER',
  (SELECT id FROM branches WHERE branch_code = 'BRT001'),
  false
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_active = EXCLUDED.is_active;

INSERT INTO users (full_name, username, email, password_hash, role, branch_id, is_active)
VALUES (
  'Checker One',
  'checker1',
  'checker1@saptakoshi.com',
  '$2b$10$dNrq3jyfwkzQrjTC.Xijyu8WzuLMnhiYa/NTsl9xKtWjpjLHFEWey',
  'CHECKER',
  (SELECT id FROM branches WHERE branch_code = 'BRT001'),
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_active = EXCLUDED.is_active;

INSERT INTO users (full_name, username, email, password_hash, role, branch_id, is_active)
VALUES (
  'Checker Two',
  'checker2',
  'checker2@saptakoshi.com',
  '$2b$10$dNrq3jyfwkzQrjTC.Xijyu8WzuLMnhiYa/NTsl9xKtWjpjLHFEWey',
  'CHECKER',
  (SELECT id FROM branches WHERE branch_code = 'BRT001'),
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  branch_id = EXCLUDED.branch_id,
  is_active = EXCLUDED.is_active;
