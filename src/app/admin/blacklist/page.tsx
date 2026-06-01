import type { AdminUserResponse } from "@/apis/generated/api";
import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { parseApiPage } from "@/lib/page-response";
import BlacklistContent from "./_components/BlacklistContent";

interface BlacklistPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
}

export default async function BlacklistPage({ searchParams }: BlacklistPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const res = await getApiAdminUsers(
    {
      page: parseApiPage(params.page),
      size: params.limit ? Number(params.limit) : 10,
      isBanned: true,
      sort: ["createdAt,asc"],
    },
    withToken(token),
  );
  return <BlacklistContent searchParams={params} blacklist={(res.data.content ?? []) as AdminUserResponse[]} />;
}
