import { AdminAmlTrainingMaterialViewContent } from "@/features/aml-training-materials/AdminAmlTrainingMaterialViewContent";

interface AdminAmlTrainingMaterialViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminAmlTrainingMaterialViewPage({
  params,
}: AdminAmlTrainingMaterialViewPageProps) {
  const { id } = await params;
  return <AdminAmlTrainingMaterialViewContent id={Number(id)} />;
}
