import { BranchEditContent } from "@/features/branches/BranchEditContent";

interface BranchEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchEditPage({ params }: BranchEditPageProps) {
  const { id } = await params;
  const branchId = Number(id);

  return <BranchEditContent branchId={branchId} />;
}
