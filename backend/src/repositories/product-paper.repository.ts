import type { ProductPaperCategory } from "@saptakoshi/shared";
import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface ProductPaperRow {
  id: number;
  category: ProductPaperCategory;
  title: string;
  description: string | null;
  original_file_name: string;
  stored_file_name: string;
  file_path: string;
  mime_type: string;
  file_size: string | number;
  uploaded_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductPaperDetailRow extends ProductPaperRow {
  uploaded_by_name: string;
}

export interface ProductPaperFilters {
  category?: ProductPaperCategory;
  search?: string;
}

export interface ProductPaperPagination {
  page: number;
  limit: number;
}

export interface CreateProductPaperInput {
  category: ProductPaperCategory;
  title: string;
  description: string | null;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: number;
}

export interface UpdateProductPaperInput {
  category: ProductPaperCategory;
  title: string;
  description: string | null;
}

const defaultExecutor: DbExecutor = { query };

const DETAIL_SELECT_COLUMNS = `
  p.id,
  p.category,
  p.title,
  p.description,
  p.original_file_name,
  p.stored_file_name,
  p.file_path,
  p.mime_type,
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

function buildFilterClause(filters: ProductPaperFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`p.category = $${params.length}`);
  }

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(p.title ILIKE ${placeholder}
        OR COALESCE(p.description, '') ILIKE ${placeholder}
        OR p.original_file_name ILIKE ${placeholder})`
    );
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

export async function countAll(filters: ProductPaperFilters = {}): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM product_papers p
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: ProductPaperFilters = {},
  pagination?: ProductPaperPagination,
  executor: DbExecutor = defaultExecutor
): Promise<ProductPaperDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return executor.query<ProductPaperDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM product_papers p
     JOIN users u ON u.id = p.uploaded_by
     ${whereClause}
     ORDER BY p.created_at DESC, p.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<ProductPaperDetailRow | null> {
  const rows = await executor.query<ProductPaperDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM product_papers p
     JOIN users u ON u.id = p.uploaded_by
     WHERE p.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function create(
  input: CreateProductPaperInput,
  executor: DbExecutor = defaultExecutor
): Promise<ProductPaperRow> {
  const rows = await executor.query<ProductPaperRow>(
    `INSERT INTO product_papers (
       category,
       title,
       description,
       original_file_name,
       stored_file_name,
       file_path,
       mime_type,
       file_size,
       uploaded_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING
       id,
       category,
       title,
       description,
       original_file_name,
       stored_file_name,
       file_path,
       mime_type,
       file_size,
       uploaded_by,
       created_at,
       updated_at`,
    [
      input.category,
      input.title,
      input.description,
      input.originalFileName,
      input.storedFileName,
      input.filePath,
      input.mimeType,
      input.fileSize,
      input.uploadedBy,
    ]
  );

  return rows[0];
}

export async function update(
  id: number,
  input: UpdateProductPaperInput,
  executor: DbExecutor = defaultExecutor
): Promise<ProductPaperDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE product_papers
     SET category = $2,
         title = $3,
         description = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, input.category, input.title, input.description]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(id, executor);
}

export async function remove(
  id: number,
  executor: DbExecutor = defaultExecutor
): Promise<ProductPaperDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `DELETE FROM product_papers
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!rows[0]) {
    return null;
  }

  return null;
}
