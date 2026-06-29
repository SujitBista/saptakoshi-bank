import { AdminProductPaperViewContent } from "@/features/product-papers/AdminProductPaperViewContent";

interface AdminProductPaperViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminProductPaperViewPage({
  params,
}: AdminProductPaperViewPageProps) {
  const { id } = await params;
  return <AdminProductPaperViewContent id={Number(id)} />;
}
