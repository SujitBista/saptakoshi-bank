import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export interface EmployeeBranchHistoryRow {
  id: number;
  user_id: number;
  old_branch_id: number | null;
  new_branch_id: number;
  transferred_by: number;
  remarks: string | null;
  transferred_at: Date;
}

export interface InsertEmployeeBranchHistoryInput {
  userId: number;
  oldBranchId: number | null;
  newBranchId: number;
  transferredBy: number;
  remarks?: string | null;
}

export async function insert(
  input: InsertEmployeeBranchHistoryInput,
  executor: DbExecutor = { query }
): Promise<EmployeeBranchHistoryRow> {
  const rows = await executor.query<EmployeeBranchHistoryRow>(
    `INSERT INTO employee_branch_history (
       user_id,
       old_branch_id,
       new_branch_id,
       transferred_by,
       remarks
     )
     VALUES ($1, $2, $3, $4, $5)
     RETURNING
       id,
       user_id,
       old_branch_id,
       new_branch_id,
       transferred_by,
       remarks,
       transferred_at`,
    [
      input.userId,
      input.oldBranchId,
      input.newBranchId,
      input.transferredBy,
      input.remarks?.trim() || null,
    ]
  );

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to create employee branch history record");
  }

  return row;
}
