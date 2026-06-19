import type { DbExecutor } from "../config/database";
import { query } from "../config/database";

export type DocumentReviewAction = "APPROVED" | "REJECTED" | "RESUBMITTED";

export interface InsertDocumentReviewHistoryInput {
  documentId: number;
  action: DocumentReviewAction;
  performedBy: number;
  remarks?: string | null;
}

const defaultExecutor: DbExecutor = { query };

export async function insert(
  input: InsertDocumentReviewHistoryInput,
  executor: DbExecutor = defaultExecutor
): Promise<void> {
  await executor.query(
    `INSERT INTO document_review_history (
       document_id,
       action,
       performed_by,
       remarks
     )
     VALUES ($1, $2, $3, $4)`,
    [
      input.documentId,
      input.action,
      input.performedBy,
      input.remarks ?? null,
    ]
  );
}
