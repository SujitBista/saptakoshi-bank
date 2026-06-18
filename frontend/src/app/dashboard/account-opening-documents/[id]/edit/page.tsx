import { AccountOpeningDocumentEditContent } from "@/features/account-opening/AccountOpeningDocumentEditContent";

interface AccountOpeningDocumentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOpeningDocumentEditPage({
  params,
}: AccountOpeningDocumentEditPageProps) {
  const { id } = await params;

  return <AccountOpeningDocumentEditContent documentId={Number(id)} />;
}
