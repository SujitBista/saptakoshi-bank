DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users RENAME COLUMN name TO full_name;
  END IF;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(50),
  ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE users
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL;

ALTER TABLE users ALTER COLUMN username SET NOT NULL;

UPDATE users SET role = UPPER(role) WHERE role IN ('admin', 'user');

ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'USER',
  ALTER COLUMN role TYPE VARCHAR(30);

ALTER TABLE users
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();
