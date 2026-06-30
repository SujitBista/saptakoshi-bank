import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface OperationTrainingMaterialRow {
  id: number;
  title: string;
  file_name: string;
  file_path: string;
  file_size: string | number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface OperationTrainingMaterialDetailRow extends OperationTrainingMaterialRow {
  uploaded_by_name: string;
}

export interface OperationTrainingMaterialFilters {
  search?: string;
}

export interface OperationTrainingMaterialPagination {
  page: number;
  limit: number;
}

export interface CreateOperationTrainingMaterialInput {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: number;
}

export interface UpdateOperationTrainingMaterialInput {
  title: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
}

const defaultExecutor: DbExecutor = { query };

const DETAIL_SELECT_COLUMNS = `
  a.id,
  a.title,
  a.file_name,
  a.file_path,
  a.file_size,
  a.uploaded_by,
  a.created_at,
  a.updated_at,
  u.full_name AS uploaded_by_name
`;

interface FilterClause {
  whereClause: string;
  params: Array<string | number>;
}

function buildFilterClause(filters: OperationTrainingMaterialFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(`a.title ILIKE ${placeholder}`);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function countAll(filters: OperationTrainingMaterialFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM operation_training_materials a
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: OperationTrainingMaterialFilters = {},
  pagination?: OperationTrainingMaterialPagination,
  executor: DbExecutor = defaultExecutor
): Promise<OperationTrainingMaterialDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return executor.query<OperationTrainingMaterialDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM operation_training_materials a
     JOIN users u ON u.id = a.uploaded_by
     ${whereClause}
     ORDER BY a.created_at DESC, a.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<OperationTrainingMaterialDetailRow | null> {
  const rows = await executor.query<OperationTrainingMaterialDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM operation_training_materials a
     JOIN users u ON u.id = a.uploaded_by
     WHERE a.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(
  input: CreateOperationTrainingMaterialInput,
  executor: DbExecutor = defaultExecutor
): Promise<OperationTrainingMaterialRow> {
  const rows = await executor.query<OperationTrainingMaterialRow>(
    `INSERT INTO operation_training_materials (
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
  input: UpdateOperationTrainingMaterialInput,
  executor: DbExecutor = defaultExecutor
): Promise<OperationTrainingMaterialDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE operation_training_materials
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
    `DELETE FROM operation_training_materials
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return Boolean(rows[0]);
}
