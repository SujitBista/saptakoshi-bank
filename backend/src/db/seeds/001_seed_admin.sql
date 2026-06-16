INSERT INTO users (full_name, username, email, password_hash, role, is_active)
VALUES (
  'Admin',
  'admin',
  'admin@saptakoshi.com',
  '$2b$10$dZSMCVLXA9PzPzDdvxlWqemD/plbMXLrTicKz28Ut.BWsH5AwUyxC',
  'ADMIN',
  true
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
