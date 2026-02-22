import type { AdminUserResponse } from "@/apis/apis";
import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
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

  const res = await getApiAdminUsers(
    {
      filters: {
        pageNumber: params.page ? Number(params.page) - 1 : 0,
        pageSize: params.limit ? Number(params.limit) : 10,
        isBanned: true,
        sortBy: "banStartDate",
        sortDirection: "asc",
      },
    },
    withToken(token),
  );
  return (
    <BlacklistContent searchParams={params} blacklist={(res.data.content ?? []) as AdminUserResponse[]} />
  );
}
