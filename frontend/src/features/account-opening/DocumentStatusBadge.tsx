import { DOCUMENT_STATUSES, type DocumentStatus } from "@saptakoshi/shared";
import { Badge } from "@/components/ui/Badge";

const statusLabels: Record<DocumentStatus, string> = {
  [DOCUMENT_STATUSES.PENDING]: "Pending",
  [DOCUMENT_STATUSES.APPROVED]: "Approved",
  [DOCUMENT_STATUSES.REJECTED]: "Rejected",
};

const statusVariants = {
  [DOCUMENT_STATUSES.PENDING]: "warning",
  [DOCUMENT_STATUSES.APPROVED]: "success",
  [DOCUMENT_STATUSES.REJECTED]: "danger",
} as const;

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
  );
}
