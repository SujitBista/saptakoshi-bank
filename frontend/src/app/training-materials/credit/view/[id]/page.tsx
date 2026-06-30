import { PublicCreditTrainingMaterialViewerContent } from "@/features/credit-training-materials/PublicCreditTrainingMaterialViewerContent";

interface CreditTrainingMaterialViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreditTrainingMaterialViewerPage({
  params,
}: CreditTrainingMaterialViewerPageProps) {
  const { id } = await params;
  return <PublicCreditTrainingMaterialViewerContent id={Number(id)} />;
}
