import { AdminCreditTrainingMaterialEditContent } from "@/features/credit-training-materials/AdminCreditTrainingMaterialEditContent";

interface AdminCreditTrainingMaterialEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCreditTrainingMaterialEditPage({
  params,
}: AdminCreditTrainingMaterialEditPageProps) {
  const { id } = await params;
  return <AdminCreditTrainingMaterialEditContent id={Number(id)} />;
}
