import { PublicItTrainingMaterialViewerContent } from "@/features/it-training-materials/PublicItTrainingMaterialViewerContent";

interface ItTrainingMaterialViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItTrainingMaterialViewerPage({
  params,
}: ItTrainingMaterialViewerPageProps) {
  const { id } = await params;
  return <PublicItTrainingMaterialViewerContent id={Number(id)} />;
}
