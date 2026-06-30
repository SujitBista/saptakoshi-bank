import { AdminRiskTrainingMaterialEditContent } from "@/features/risk-training-materials/AdminRiskTrainingMaterialEditContent";

interface AdminRiskTrainingMaterialEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminRiskTrainingMaterialEditPage({
  params,
}: AdminRiskTrainingMaterialEditPageProps) {
  const { id } = await params;
  return <AdminRiskTrainingMaterialEditContent id={Number(id)} />;
}
