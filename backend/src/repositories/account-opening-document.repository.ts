import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface AccountOpeningDocumentRow {
  id: number;
  branch_id: number;
  uploaded_by: number;
  client_code: string;
  first_name: string;
  last_name: string;
  father_name: string | null;
  citizen_no: string;
  mobile_number: string;
  document_no: string;
  original_file_name: string;
  stored_file_name: string;
  relative_file_path: string;
  mime_type: string | null;
  file_size: string | number | null;
  created_at: Date;
  updated_at: Date;
}

export interface AccountOpeningDocumentDetailRow extends AccountOpeningDocumentRow {
  branch_code: string;
  branch_name: string;
  uploaded_by_name: string;
}

export interface AccountOpeningDocumentFilters {
  search?: string;
  clientCode?: string;
  documentNo?: string;
  branchId?: number;
}

export interface AccountOpeningDocumentPagination {
  page: number;
  limit: number;
}

export interface UpdateAccountOpeningDocumentInput {
  firstName: string;
  lastName: string;
  fatherName: string | null;
  citizenNo: string;
  mobileNumber: string;
  originalFileName?: string;
  mimeType?: string | null;
  fileSize?: number;
}

export interface CreateAccountOpeningDocumentInput {
  branchId: number;
  uploadedBy: number;
  clientCode: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  citizenNo: string;
  mobileNumber: string;
  documentNo: string;
  originalFileName: string;
  storedFileName: string;
  relativeFilePath: string;
  mimeType: string | null;
  fileSize: number;
}

const defaultExecutor: DbExecutor = { query };

const DETAIL_SELECT_COLUMNS = `
  d.id,
  d.branch_id,
  d.uploaded_by,
  d.client_code,
  d.first_name,
  d.last_name,
  d.father_name,
  d.citizen_no,
  d.mobile_number,
  d.document_no,
  d.original_file_name,
  d.stored_file_name,
  d.relative_file_path,
  d.mime_type,
  d.file_size,
  d.created_at,
  d.updated_at,
  b.branch_code,
  b.branch_name,
  u.full_name AS uploaded_by_name
`;

interface FilterClause {
  whereClause: string;
  params: Array<string | number>;
}

function buildFilterClause(filters: AccountOpeningDocumentFilters): FilterClause {
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filters.branchId !== undefined) {
    params.push(filters.branchId);
    conditions.push(`d.branch_id = $${params.length}`);
  }

  if (filters.clientCode?.trim()) {
    params.push(`%${filters.clientCode.trim()}%`);
    conditions.push(`d.client_code ILIKE $${params.length}`);
  }

  if (filters.documentNo?.trim()) {
    params.push(`%${filters.documentNo.trim()}%`);
    conditions.push(`d.document_no ILIKE $${params.length}`);
  }

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const placeholder = `$${params.length}`;
    conditions.push(
      `(d.first_name ILIKE ${placeholder}
        OR d.last_name ILIKE ${placeholder}
        OR d.father_name ILIKE ${placeholder}
        OR d.citizen_no ILIKE ${placeholder}
        OR d.mobile_number ILIKE ${placeholder}
        OR d.client_code ILIKE ${placeholder}
        OR d.document_no ILIKE ${placeholder})`
    );
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, params };
}

export async function countAll(
  filters: AccountOpeningDocumentFilters = {}
): Promise<number> {
  const { whereClause, params } = buildFilterClause(filters);
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM account_opening_documents d
     ${whereClause}`,
    params
  );

  return Number(rows[0]?.count ?? 0);
}

export async function findAll(
  filters: AccountOpeningDocumentFilters = {},
  pagination?: AccountOpeningDocumentPagination
): Promise<AccountOpeningDocumentDetailRow[]> {
  const { whereClause, params } = buildFilterClause(filters);
  const queryParams: Array<string | number> = [...params];

  let paginationClause = "";

  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    queryParams.push(pagination.limit, offset);
    paginationClause = ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
  }

  return query<AccountOpeningDocumentDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM account_opening_documents d
     JOIN branches b ON b.id = d.branch_id
     JOIN users u ON u.id = d.uploaded_by
     ${whereClause}
     ORDER BY d.created_at DESC, d.id DESC${paginationClause}`,
    queryParams
  );
}

export async function findById(
  id: number
): Promise<AccountOpeningDocumentDetailRow | null> {
  const rows = await query<AccountOpeningDocumentDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
     FROM account_opening_documents d
     JOIN branches b ON b.id = d.branch_id
     JOIN users u ON u.id = d.uploaded_by
     WHERE d.id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

export async function update(
  id: number,
  input: UpdateAccountOpeningDocumentInput,
  executor: DbExecutor = defaultExecutor
): Promise<AccountOpeningDocumentDetailRow | null> {
  const rows = await executor.query<{ id: number }>(
    `UPDATE account_opening_documents
     SET first_name = $2,
         last_name = $3,
         father_name = $4,
         citizen_no = $5,
         mobile_number = $6,
         original_file_name = COALESCE($7, original_file_name),
         mime_type = COALESCE($8, mime_type),
         file_size = COALESCE($9, file_size),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      input.firstName,
      input.lastName,
      input.fatherName,
      input.citizenNo,
      input.mobileNumber,
      input.originalFileName ?? null,
      input.mimeType ?? null,
      input.fileSize ?? null,
    ]
  );

  if (!rows[0]) {
    return null;
  }

  return findById(id);
}

export async function getNextDocumentSequence(
  branchId: number,
  branchCode: string,
  year: number,
  executor: DbExecutor = defaultExecutor
): Promise<number> {
  await executor.query(
    "SELECT pg_advisory_xact_lock(hashtext($1))",
    [`account-opening:${branchCode}:${year}`]
  );

  const rows = await executor.query<{ next_number: string }>(
    `SELECT COALESCE(MAX(RIGHT(document_no, 6)::integer), 0) + 1 AS next_number
     FROM account_opening_documents
     WHERE branch_id = $1
       AND document_no LIKE $2`,
    [branchId, `${branchCode}-${year}-%`]
  );

  return Number(rows[0]?.next_number ?? 1);
}

export async function create(
  input: CreateAccountOpeningDocumentInput,
  executor: DbExecutor = defaultExecutor
): Promise<AccountOpeningDocumentRow> {
  const rows = await executor.query<AccountOpeningDocumentRow>(
    `INSERT INTO account_opening_documents (
       branch_id,
       uploaded_by,
       client_code,
       first_name,
       last_name,
       father_name,
       citizen_no,
       mobile_number,
       document_no,
       original_file_name,
       stored_file_name,
       relative_file_path,
       mime_type,
       file_size
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING
       id,
       branch_id,
       uploaded_by,
       client_code,
       first_name,
       last_name,
       father_name,
       citizen_no,
       mobile_number,
       document_no,
       original_file_name,
       stored_file_name,
       relative_file_path,
       mime_type,
       file_size,
       created_at,
       updated_at`,
    [
      input.branchId,
      input.uploadedBy,
      input.clientCode,
      input.firstName,
      input.lastName,
      input.fatherName,
      input.citizenNo,
      input.mobileNumber,
      input.documentNo,
      input.originalFileName,
      input.storedFileName,
      input.relativeFilePath,
      input.mimeType,
      input.fileSize,
    ]
  );

  return rows[0];
}
