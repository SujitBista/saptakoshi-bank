import { AdminCircularViewContent } from "@/features/circulars/AdminCircularViewContent";

interface AdminCircularViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCircularViewPage({ params }: AdminCircularViewPageProps) {
  const { id } = await params;
  return <AdminCircularViewContent id={Number(id)} />;
}
