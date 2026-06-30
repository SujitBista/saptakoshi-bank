import { AdminAmlTrainingMaterialEditContent } from "@/features/aml-training-materials/AdminAmlTrainingMaterialEditContent";

interface AdminAmlTrainingMaterialEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminAmlTrainingMaterialEditPage({
  params,
}: AdminAmlTrainingMaterialEditPageProps) {
  const { id } = await params;
  return <AdminAmlTrainingMaterialEditContent id={Number(id)} />;
}
