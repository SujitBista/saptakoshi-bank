import { AdminProductPaperEditContent } from "@/features/product-papers/AdminProductPaperEditContent";

interface AdminProductPaperEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminProductPaperEditPage({
  params,
}: AdminProductPaperEditPageProps) {
  const { id } = await params;
  return <AdminProductPaperEditContent id={Number(id)} />;
}
