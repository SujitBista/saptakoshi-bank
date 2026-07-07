import { query } from "../config/database";
import type { DbExecutor } from "../config/database";

export interface UserRow {
  id: number;
  branch_id: number | null;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
  must_reset_password: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithBranchRow extends UserRow {
  branch_code: string | null;
  branch_name: string | null;
}

export interface UserFilters {
  search?: string;
  branchId?: number;
  role?: string;
  isActive?: boolean;
}

export interface UserPagination {
  page: number;
  limit: number;
}

interface FilterClause {
  whereClause: string;
  params: Array<string | number | boolean>;
}

const USER_SELECT_COLUMNS = `
  u.id,
  u.branch_id,
  u.full_name,
  u.username,
  u.email,
  u.password_hash,
  u.role,
  u.is_active,
  u.must_reset_password,
  u.created_at,
  u.updated_at,
  b.branch_code,
  b.branch_name
`;

function buildFilterClause(filters: UserFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number | boolean> = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(u.full_name ILIKE ${placeholder} OR u.username ILIKE ${placeholder} OR u.email ILIKE ${placeholder})`
    );
  }

  if (filters.branchId !== undefined) {
    params.push(filters.branchId);
    conditions.push(`u.branch_id = $${params.length}`);
  }

  if (filters.role?.trim()) {
    params.push(filters.role.trim().toUpperCase());
    conditions.push(`u.role = $${params.length}`);
  }

  if (filters.isActive !== undefined) {
    params.push(filters.isActive);
    conditions.push(`u.is_active = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, params };
}

export interface CreateUserInput {
  branchId: number | null;
  fullName: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  mustResetPassword: boolean;
}

export interface UpdateUserInput {
  branchId: number | null;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export async function countAll(filters: UserFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM users u
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: UserFilters = {},
  pagination?: UserPagination
): Promise<UserWithBranchRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number | boolean> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return query<UserWithBranchRow>(
    `SELECT ${USER_SELECT_COLUMNS}
     FROM users u
     LEFT JOIN branches b ON b.id = u.branch_id
     ${whereClause}
     ORDER BY u.created_at DESC, u.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = { query }
): Promise<UserWithBranchRow | null> {
  const rows = await executor.query<UserWithBranchRow>(
    `SELECT ${USER_SELECT_COLUMNS}
     FROM users u
     LEFT JOIN branches b ON b.id = u.branch_id
     WHERE u.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function findByEmail(
  email: string,
  excludeId?: number
): Promise<UserWithBranchRow | null> {
  const params: (string | number)[] = [email.trim().toLowerCase()];
  let sql = `SELECT ${USER_SELECT_COLUMNS}
             FROM users u
             LEFT JOIN branches b ON b.id = u.branch_id
             WHERE LOWER(u.email) = $1`;

  if (excludeId !== undefined) {
    params.push(excludeId);
    sql += ` AND u.id <> $2`;
  }

  const rows = await query<UserWithBranchRow>(sql, params);
  return rows[0] ?? null;
}

export async function create(input: CreateUserInput): Promise<UserWithBranchRow> {
  const rows = await query<{ id: number }>(
    `INSERT INTO users (
       branch_id,
       full_name,
       username,
       email,
       password_hash,
       role,
       is_active,
       must_reset_password
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      input.branchId,
      input.fullName,
      input.username,
      input.email,
      input.passwordHash,
      input.role,
      input.isActive,
      input.mustResetPassword,
    ]
  );

  const created = await findById(rows[0].id);
  if (!created) {
    throw new Error("Failed to load created user");
  }

  return created;
}

export async function update(
  id: number,
  input: UpdateUserInput
): Promise<UserWithBranchRow | null> {
  const rows = await query<{ id: number }>(
    `UPDATE users
     SET branch_id = $2,
         full_name = $3,
         username = $4,
         email = $5,
         role = $6,
         is_active = $7,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      input.branchId,
      input.fullName,
      input.username,
      input.email,
      input.role,
      input.isActive,
    ]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
}

export async function updateStatus(
  id: number,
  isActive: boolean
): Promise<UserWithBranchRow | null> {
  const rows = await query<{ id: number }>(
    `UPDATE users
     SET is_active = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, isActive]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
}

export async function updateBranchId(
  id: number,
  branchId: number,
  executor: DbExecutor = { query }
): Promise<number | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE users
     SET branch_id = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, branchId]
  );

  return rows[0]?.id ?? null;
}

export async function updatePassword(
  id: number,
  passwordHash: string,
  mustResetPassword: boolean
): Promise<UserWithBranchRow | null> {
  const rows = await query<{ id: number }>(
    `UPDATE users
     SET password_hash = $2,
         must_reset_password = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, passwordHash, mustResetPassword]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(rows[0].id);
}
