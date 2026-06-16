import { query } from "../config/database";

export interface BranchRow {
  id: number;
  branch_code: string;
  branch_name: string;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BranchFilters {
  branchCode?: string;
  branchName?: string;
}

export interface BranchPagination {
  page: number;
  limit: number;
}

interface FilterClause {
  whereClause: string;
  params: string[];
}

function buildFilterClause(filters: BranchFilters): FilterClause {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filters.branchCode?.trim()) {
    params.push(`%${filters.branchCode.trim()}%`);
    conditions.push(`branch_code ILIKE $${params.length}`);
  }

  if (filters.branchName?.trim()) {
    params.push(`%${filters.branchName.trim()}%`);
    conditions.push(`branch_name ILIKE $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, params };
}

export interface CreateBranchInput {
  branchCode: string;
  branchName: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface UpdateBranchInput {
  branchCode: string;
  branchName: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isActive: boolean;
}

export async function countAll(filters: BranchFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM branches ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: BranchFilters = {},
  pagination?: BranchPagination
): Promise<BranchRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return query<BranchRow>(
    `SELECT id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at
     FROM branches
     ${whereClause}
     ORDER BY created_at DESC, id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(id: number): Promise<BranchRow | null> {
  const rows = await query<BranchRow>(
    `SELECT id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at
     FROM branches
     WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function findByBranchCode(
  branchCode: string,
  excludeId?: number
): Promise<BranchRow | null> {
  const params: (string | number)[] = [branchCode];
  let sql = `SELECT id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at
             FROM branches
             WHERE branch_code = $1`;

  if (excludeId !== undefined) {
    params.push(excludeId);
    sql += ` AND id <> $2`;
  }

  const rows = await query<BranchRow>(sql, params);
  return rows[0] ?? null;
}

export async function create(input: CreateBranchInput): Promise<BranchRow> {
  const rows = await query<BranchRow>(
    `INSERT INTO branches (branch_code, branch_name, address, phone_number, email, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at`,
    [
      input.branchCode,
      input.branchName,
      input.address ?? null,
      input.phoneNumber ?? null,
      input.email ?? null,
      input.isActive,
    ]
  );

  return rows[0];
}

export async function update(
  id: number,
  input: UpdateBranchInput
): Promise<BranchRow | null> {
  const rows = await query<BranchRow>(
    `UPDATE branches
     SET branch_code = $2,
         branch_name = $3,
         address = $4,
         phone_number = $5,
         email = $6,
         is_active = $7,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at`,
    [
      id,
      input.branchCode,
      input.branchName,
      input.address ?? null,
      input.phoneNumber ?? null,
      input.email ?? null,
      input.isActive,
    ]
  );

  return rows[0] ?? null;
}

export async function updateStatus(
  id: number,
  isActive: boolean
): Promise<BranchRow | null> {
  const rows = await query<BranchRow>(
    `UPDATE branches
     SET is_active = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, branch_code, branch_name, address, phone_number, email, is_active, created_at, updated_at`,
    [id, isActive]
  );

  return rows[0] ?? null;
}
