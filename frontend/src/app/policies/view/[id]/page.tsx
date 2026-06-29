import { PublicPolicyViewerContent } from "@/features/policies/PublicPolicyViewerContent";

interface PolicyViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PolicyViewerPage({ params }: PolicyViewerPageProps) {
  const { id } = await params;
  return <PublicPolicyViewerContent id={Number(id)} />;
}
