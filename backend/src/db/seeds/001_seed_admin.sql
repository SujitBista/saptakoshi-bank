INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin',
  'admin@saptakoshi.com',
  '$2b$10$dZSMCVLXA9PzPzDdvxlWqemD/plbMXLrTicKz28Ut.BWsH5AwUyxC',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;
