import { AccountOpeningDocumentViewContent } from "@/features/account-opening/AccountOpeningDocumentViewContent";

interface AccountOpeningDocumentViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOpeningDocumentViewPage({
  params,
}: AccountOpeningDocumentViewPageProps) {
  const { id } = await params;

  return <AccountOpeningDocumentViewContent documentId={Number(id)} />;
}
