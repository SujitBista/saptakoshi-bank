import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface ItTrainingMaterialRow {
  id: number;
  title: string;
  file_name: string;
  file_path: string;
  file_size: string | number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface ItTrainingMaterialDetailRow extends ItTrainingMaterialRow {
  uploaded_by_name: string;
}

export interface ItTrainingMaterialFilters {
  search?: string;
}

export interface ItTrainingMaterialPagination {
  page: number;
  limit: number;
}

export interface CreateItTrainingMaterialInput {
  title: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: number;
}

export interface UpdateItTrainingMaterialInput {
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

function buildFilterClause(filters: ItTrainingMaterialFilters): FilterClause {
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

export async function countAll(filters: ItTrainingMaterialFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM it_training_materials a
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: ItTrainingMaterialFilters = {},
  pagination?: ItTrainingMaterialPagination,
  executor: DbExecutor = defaultExecutor
): Promise<ItTrainingMaterialDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return executor.query<ItTrainingMaterialDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM it_training_materials a
     JOIN users u ON u.id = a.uploaded_by
     ${whereClause}
     ORDER BY a.created_at DESC, a.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<ItTrainingMaterialDetailRow | null> {
  const rows = await executor.query<ItTrainingMaterialDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM it_training_materials a
     JOIN users u ON u.id = a.uploaded_by
     WHERE a.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(
  input: CreateItTrainingMaterialInput,
  executor: DbExecutor = defaultExecutor
): Promise<ItTrainingMaterialRow> {
  const rows = await executor.query<ItTrainingMaterialRow>(
    `INSERT INTO it_training_materials (
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
  input: UpdateItTrainingMaterialInput,
  executor: DbExecutor = defaultExecutor
): Promise<ItTrainingMaterialDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE it_training_materials
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
    `DELETE FROM it_training_materials
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return Boolean(rows[0]);
}
