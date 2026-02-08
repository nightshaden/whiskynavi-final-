import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";
import UserEditContent from "./_components/UserEditContent";

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  const user = await adminApi.getUser(Number(userId), { token });

  return <UserEditContent user={user} />;
}
