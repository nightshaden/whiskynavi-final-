import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";
import UsersContent from "./_components/UsersContent";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    role?: string;
    navi?: string;
    tales?: string;
    business?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const users = await adminApi.getUsers(
    {
      pageNumber: params.page ? Number(params.page) - 1 : 0,
      pageSize: params.limit ? Number(params.limit) : 20,
      name: params.q || undefined,
      role: params.role || undefined,
      status: params.status || undefined,
      sortBy: params.sortBy || "createdAt",
      sortDirection: params.sortDirection || "desc",
    },
    { token },
  );

  return (
    <UsersContent
      searchParams={params}
      users={users.content}
      totalElements={users.totalElements}
    />
  );
}
