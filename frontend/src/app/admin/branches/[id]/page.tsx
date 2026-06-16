import { BranchViewContent } from "@/features/branches/BranchViewContent";

interface BranchViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchViewPage({ params }: BranchViewPageProps) {
  const { id } = await params;
  const branchId = Number(id);

  return <BranchViewContent branchId={branchId} />;
}
