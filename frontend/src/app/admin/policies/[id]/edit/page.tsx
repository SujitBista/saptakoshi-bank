import { AdminPolicyEditContent } from "@/features/policies/AdminPolicyEditContent";

interface AdminPolicyEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminPolicyEditPage({ params }: AdminPolicyEditPageProps) {
  const { id } = await params;
  return <AdminPolicyEditContent id={Number(id)} />;
}
