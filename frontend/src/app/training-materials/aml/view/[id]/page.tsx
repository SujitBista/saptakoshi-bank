import { PublicAmlTrainingMaterialViewerContent } from "@/features/aml-training-materials/PublicAmlTrainingMaterialViewerContent";

interface AmlTrainingMaterialViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AmlTrainingMaterialViewerPage({
  params,
}: AmlTrainingMaterialViewerPageProps) {
  const { id } = await params;
  return <PublicAmlTrainingMaterialViewerContent id={Number(id)} />;
}
