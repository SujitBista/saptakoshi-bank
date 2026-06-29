import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface CircularRow {
  id: number;
  title: string;
  file_name: string;
  file_path: string;
  file_size: string | number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface CircularDetailRow extends CircularRow {
  uploaded_by_name: string;
}

export interface CircularFilters {
  search?: string;
}

export interface CircularPagination {
  page: number;
  limit: number;
}

export interface CreateCircularInput {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: number;
}

export interface UpdateCircularInput {
  title: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
}

const defaultExecutor: DbExecutor = { query };

const DETAIL_SELECT_COLUMNS = `
  c.id,
  c.title,
  c.file_name,
  c.file_path,
  c.file_size,
  c.uploaded_by,
  c.created_at,
  c.updated_at,
  u.full_name AS uploaded_by_name
`;

interface FilterClause {
  whereClause: string;
  params: Array<string | number>;
}

function buildFilterClause(filters: CircularFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(`c.title ILIKE ${placeholder}`);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function countAll(filters: CircularFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM circulars c
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: CircularFilters = {},
  pagination?: CircularPagination,
  executor: DbExecutor = defaultExecutor
): Promise<CircularDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return executor.query<CircularDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM circulars c
     JOIN users u ON u.id = c.uploaded_by
     ${whereClause}
     ORDER BY c.created_at DESC, c.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<CircularDetailRow | null> {
  const rows = await executor.query<CircularDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM circulars c
     JOIN users u ON u.id = c.uploaded_by
     WHERE c.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(
  input: CreateCircularInput,
  executor: DbExecutor = defaultExecutor
): Promise<CircularRow> {
  const rows = await executor.query<CircularRow>(
    `INSERT INTO circulars (
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

export async function update(
  id: number,
  input: UpdateCircularInput,
  executor: DbExecutor = defaultExecutor
): Promise<CircularDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE circulars
     SET title = $2,
         file_name = COALESCE($3, file_name),
         file_path = COALESCE($4, file_path),
         file_size = COALESCE($5, file_size),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      input.title,
      input.fileName ?? null,
      input.filePath ?? null,
      input.fileSize ?? null,
    ]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(id, executor);
}

export async function remove(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<boolean> {
  const rows = await executor.query<{ id: number }>(
    `DELETE FROM circulars
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return Boolean(rows[0]);
}
