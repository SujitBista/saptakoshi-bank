INSERT INTO branches (branch_code, branch_name, address, phone_number, email, is_active)
SELECT
  'BR' || LPAD(series.n::text, 4, '0'),
  'Branch ' || series.n,
  'Address Line ' || series.n || ', Nepal',
  '+977-' || LPAD((series.n % 1000)::text, 7, '0'),
  'branch' || series.n || '@saptakoshi.com',
  series.n % 7 <> 0
FROM generate_series(4, 100) AS series(n)
ON CONFLICT (branch_code) DO UPDATE SET
  branch_name = EXCLUDED.branch_name,
  address = EXCLUDED.address,
  phone_number = EXCLUDED.phone_number,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;
