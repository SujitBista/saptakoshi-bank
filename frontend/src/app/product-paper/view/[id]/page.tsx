import { PublicProductPaperViewerContent } from "@/features/product-papers/PublicProductPaperViewerContent";

interface ProductPaperViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPaperViewerPage({
  params,
}: ProductPaperViewerPageProps) {
  const { id } = await params;
  return <PublicProductPaperViewerContent id={Number(id)} />;
}
