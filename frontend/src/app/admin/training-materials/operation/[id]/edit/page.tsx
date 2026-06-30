import { AdminOperationTrainingMaterialEditContent } from "@/features/operation-training-materials/AdminOperationTrainingMaterialEditContent";

interface AdminOperationTrainingMaterialEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOperationTrainingMaterialEditPage({
  params,
}: AdminOperationTrainingMaterialEditPageProps) {
  const { id } = await params;
  return <AdminOperationTrainingMaterialEditContent id={Number(id)} />;
}
