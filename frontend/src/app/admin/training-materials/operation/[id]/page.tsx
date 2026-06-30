import { AdminOperationTrainingMaterialViewContent } from "@/features/operation-training-materials/AdminOperationTrainingMaterialViewContent";

interface AdminOperationTrainingMaterialViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOperationTrainingMaterialViewPage({
  params,
}: AdminOperationTrainingMaterialViewPageProps) {
  const { id } = await params;
  return <AdminOperationTrainingMaterialViewContent id={Number(id)} />;
}
