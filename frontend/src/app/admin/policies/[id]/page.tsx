import { AdminPolicyViewContent } from "@/features/policies/AdminPolicyViewContent";

interface AdminPolicyViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminPolicyViewPage({ params }: AdminPolicyViewPageProps) {
  const { id } = await params;
  return <AdminPolicyViewContent id={Number(id)} />;
}
