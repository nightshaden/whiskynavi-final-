import { getApiAdminUsersId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import UserEditContent from "./_components/UserEditContent";

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();
  let user;

  try {
    const res = await getApiAdminUsersId(Number(userId), withToken(token));
    user = res.data;
  } catch {
    notFound();
  }

  return <UserEditContent user={user} />;
}
