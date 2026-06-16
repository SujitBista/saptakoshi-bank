import { UserEditContent } from "@/features/users/UserEditContent";

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  return <UserEditContent userId={Number(id)} />;
}
