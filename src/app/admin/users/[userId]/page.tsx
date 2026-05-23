import { getApiAdminOrdersUsersUserid, getApiAdminUsersId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import UserDetailContent from "./_components/UserDetailContent";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();
  let user;
  let orderSummary;

  try {
    const [userRes, orderRes] = await Promise.all([
      getApiAdminUsersId(Number(userId), withToken(token)),
      getApiAdminOrdersUsersUserid(Number(userId), { page: 0, size: 20 }, withToken(token)),
    ]);
    user = userRes.data;
    orderSummary = orderRes.data;
  } catch {
    notFound();
  }

  return <UserDetailContent user={user} orderSummary={orderSummary} />;
}
