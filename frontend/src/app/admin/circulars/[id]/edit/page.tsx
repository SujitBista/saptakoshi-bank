import { AdminCircularEditContent } from "@/features/circulars/AdminCircularEditContent";

interface AdminCircularEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCircularEditPage({ params }: AdminCircularEditPageProps) {
  const { id } = await params;
  return <AdminCircularEditContent id={Number(id)} />;
}
