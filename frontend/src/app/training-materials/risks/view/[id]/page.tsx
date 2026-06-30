import { PublicRiskTrainingMaterialViewerContent } from "@/features/risk-training-materials/PublicRiskTrainingMaterialViewerContent";

interface RiskTrainingMaterialViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RiskTrainingMaterialViewerPage({
  params,
}: RiskTrainingMaterialViewerPageProps) {
  const { id } = await params;
  return <PublicRiskTrainingMaterialViewerContent id={Number(id)} />;
}
