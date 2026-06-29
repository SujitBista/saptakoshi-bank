import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface PolicyRow {
  id: number;
  title: string;
  file_name: string;
  file_path: string;
  file_size: string | number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface PolicyDetailRow extends PolicyRow {
  uploaded_by_name: string;
}

export interface PolicyFilters {
  search?: string;
}

export interface PolicyPagination {
  page: number;
  limit: number;
}

export interface CreatePolicyInput {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: number;
}

const defaultExecutor: DbExecutor = { query };

const DETAIL_SELECT_COLUMNS = `
  p.id,
  p.title,
  p.file_name,
  p.file_path,
  p.file_size,
  p.uploaded_by,
  p.created_at,
  p.updated_at,
  u.full_name AS uploaded_by_name
`;

interface FilterClause {
  whereClause: string;
  params: Array<string | number>;
}

function buildFilterClause(filters: PolicyFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(`p.title ILIKE ${placeholder}`);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function countAll(filters: PolicyFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM policies p
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: PolicyFilters = {},
  pagination?: PolicyPagination,
  executor: DbExecutor = defaultExecutor
): Promise<PolicyDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return executor.query<PolicyDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM policies p
     JOIN users u ON u.id = p.uploaded_by
     ${whereClause}
     ORDER BY p.created_at DESC, p.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<PolicyDetailRow | null> {
  const rows = await executor.query<PolicyDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM policies p
     JOIN users u ON u.id = p.uploaded_by
     WHERE p.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(
  input: CreatePolicyInput,
  executor: DbExecutor = defaultExecutor
): Promise<PolicyRow> {
  const rows = await executor.query<PolicyRow>(
    `INSERT INTO policies (
       title,
       file_name,
       file_path,
       file_size,
       uploaded_by
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       title,
       file_name,
       file_path,
       file_size,
       uploaded_by,
       created_at,
       updated_at`,
    [
      input.title,
      input.fileName,
      input.filePath,
      input.fileSize,
      input.uploadedBy,
    ]
  );

  return rows[0];
}

export async function remove(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<boolean> {
  const rows = await executor.query<{ id: number }>(
    `DELETE FROM policies
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return Boolean(rows[0]);
}
