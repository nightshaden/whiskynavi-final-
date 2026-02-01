import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";
import BlacklistContent from "./_components/BlacklistContent";

interface BlacklistPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
}

export default async function BlacklistPage({
  searchParams,
}: BlacklistPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const blacklist = await adminApi.getUsers(
    {
      pageNumber: params.page ? Number(params.page) : 0,
      pageSize: params.limit ? Number(params.limit) : 10,
      isBanned: true,
      sortBy: "banStartDate",
      sortDirection: "asc",
    },
    { token },
  );

  return (
    <BlacklistContent searchParams={params} blacklist={blacklist.content} />
  );
}
