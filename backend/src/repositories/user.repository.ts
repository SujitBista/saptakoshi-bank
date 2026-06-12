import { query } from "../config/database";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
    [email]
  );
  return rows[0] ?? null;
}
