import { notFound } from "next/navigation";
import {
  getApiAdminUsersId,
  getApiAdminOrdersUsersUserid,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { withToken } from "@/apis/mutator";
import UserDetailContent from "./_components/UserDetailContent";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  try {
    const [userRes, orderRes] = await Promise.all([
      getApiAdminUsersId(Number(userId), withToken(token)),
      getApiAdminOrdersUsersUserid(
        Number(userId),
        { page: 0, size: 20 },
        withToken(token),
      ),
    ]);

    return (
      <UserDetailContent user={userRes.data} orderSummary={orderRes.data} />
    );
  } catch {
    notFound();
  }
}
