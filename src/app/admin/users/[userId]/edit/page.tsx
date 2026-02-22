import { notFound } from "next/navigation";
import { getApiAdminUsersId } from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { withToken } from "@/apis/mutator";
import UserEditContent from "./_components/UserEditContent";

interface UserEditPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  try {
    const res = await getApiAdminUsersId(Number(userId), withToken(token));
    return <UserEditContent user={res.data} />;
  } catch {
    notFound();
  }
}
