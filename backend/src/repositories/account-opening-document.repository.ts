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
