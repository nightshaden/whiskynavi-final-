import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";
import UserDetailContent from "./_components/UserDetailContent";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  const [user, orderSummary] = await Promise.all([
    adminApi.getUser(Number(userId), { token }),
    adminApi.getUserOrders(Number(userId), { page: 0, size: 20 }, { token }),
  ]);
  
  return <UserDetailContent user={user} orderSummary={orderSummary} />;
}
