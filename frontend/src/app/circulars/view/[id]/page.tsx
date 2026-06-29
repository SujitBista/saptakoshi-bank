import { PublicCircularViewerContent } from "@/features/circulars/PublicCircularViewerContent";

interface CircularViewerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CircularViewerPage({ params }: CircularViewerPageProps) {
  const { id } = await params;
  return <PublicCircularViewerContent id={Number(id)} />;
}
