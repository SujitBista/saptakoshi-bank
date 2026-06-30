import { AdminItTrainingMaterialViewContent } from "@/features/it-training-materials/AdminItTrainingMaterialViewContent";

interface AdminItTrainingMaterialViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminItTrainingMaterialViewPage({
  params,
}: AdminItTrainingMaterialViewPageProps) {
  const { id } = await params;
  return <AdminItTrainingMaterialViewContent id={Number(id)} />;
}
