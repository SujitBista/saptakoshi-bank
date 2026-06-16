INSERT INTO branches (branch_code, branch_name, address, phone_number, email, is_active)
VALUES
  (
    'BRT001',
    'Biratnagar Main Branch',
    'Biratnagar-9, Morang, Nepal',
    '+977-21-123456',
    'biratnagar@saptakoshi.com',
    TRUE
  ),
  (
    'KTM001',
    'Kathmandu Main Branch',
    'Kathmandu, Nepal',
    '+977-1-123456',
    'kathmandu@saptakoshi.com',
    TRUE
  ),
  (
    'DHR001',
    'Dharan Branch',
    'Dharan, Sunsari, Nepal',
    '+977-25-123456',
    'dharan@saptakoshi.com',
    TRUE
  )
ON CONFLICT (branch_code) DO UPDATE SET
  branch_name = EXCLUDED.branch_name,
  address = EXCLUDED.address,
  phone_number = EXCLUDED.phone_number,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;
