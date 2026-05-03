import { getApiAdminBusinessesMembers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { resolveBusinessMembersSort } from "./sort";
import BusinessMembersContent from "./_components/BusinessMembersContent";

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
  }>;
}

export default async function BusinessMembersPage({
  searchParams,
}: BusinessMembersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const resolvedSort = resolveBusinessMembersSort(params.sort);

  const res = await getApiAdminBusinessesMembers(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
      sort: [resolvedSort],
    },
    withToken(token),
  );

  return (
    <BusinessMembersContent
      searchParams={{
        ...params,
        sort: resolvedSort,
      }}
      members={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
