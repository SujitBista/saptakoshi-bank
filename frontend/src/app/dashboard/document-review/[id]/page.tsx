import { DocumentReviewViewContent } from "@/features/account-opening/DocumentReviewViewContent";

interface DocumentReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentReviewDetailPage({
  params,
}: DocumentReviewDetailPageProps) {
  const { id } = await params;
  const documentId = Number(id);

  return <DocumentReviewViewContent documentId={documentId} />;
}
