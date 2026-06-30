import { PublicOperationTrainingMaterialViewerContent } from "@/features/operation-training-materials/PublicOperationTrainingMaterialViewerContent";

interface OperationTrainingMaterialViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OperationTrainingMaterialViewerPage({
  params,
}: OperationTrainingMaterialViewerPageProps) {
  const { id } = await params;
  return <PublicOperationTrainingMaterialViewerContent id={Number(id)} />;
}
