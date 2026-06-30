import { AdminRiskTrainingMaterialViewContent } from "@/features/risk-training-materials/AdminRiskTrainingMaterialViewContent";

interface AdminRiskTrainingMaterialViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminRiskTrainingMaterialViewPage({
  params,
}: AdminRiskTrainingMaterialViewPageProps) {
  const { id } = await params;
  return <AdminRiskTrainingMaterialViewContent id={Number(id)} />;
}
