import { AdminItTrainingMaterialEditContent } from "@/features/it-training-materials/AdminItTrainingMaterialEditContent";

interface AdminItTrainingMaterialEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminItTrainingMaterialEditPage({
  params,
}: AdminItTrainingMaterialEditPageProps) {
  const { id } = await params;
  return <AdminItTrainingMaterialEditContent id={Number(id)} />;
}
