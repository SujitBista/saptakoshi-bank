import { AdminCreditTrainingMaterialViewContent } from "@/features/credit-training-materials/AdminCreditTrainingMaterialViewContent";

interface AdminCreditTrainingMaterialViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCreditTrainingMaterialViewPage({
  params,
}: AdminCreditTrainingMaterialViewPageProps) {
  const { id } = await params;
  return <AdminCreditTrainingMaterialViewContent id={Number(id)} />;
}
