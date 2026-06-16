import { UserViewContent } from "@/features/users/UserViewContent";

interface UserViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserViewPage({ params }: UserViewPageProps) {
  const { id } = await params;
  return <UserViewContent userId={Number(id)} />;
}
