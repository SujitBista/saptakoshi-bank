import { DocumentReviewViewContent } from "@/features/account-opening/DocumentReviewViewContent";

interface AdminDocumentReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDocumentReviewDetailPage({
  params,
}: AdminDocumentReviewDetailPageProps) {
  const { id } = await params;
  const documentId = Number(id);

  return <DocumentReviewViewContent documentId={documentId} variant="admin" />;
}
