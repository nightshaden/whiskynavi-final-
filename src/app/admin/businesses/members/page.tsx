import { getApiAdminBusinessesMembers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessMembersContent from "./_components/BusinessMembersContent";

const DEFAULT_SORT = "userId,desc";
const ALLOWED_SORTS = [DEFAULT_SORT, "userId,asc"] as const;

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
  }>;
}

function resolveSort(sort?: string) {
  return ALLOWED_SORTS.find((allowedSort) => allowedSort === sort) ?? DEFAULT_SORT;
}

export default async function BusinessMembersPage({
  searchParams,
}: BusinessMembersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const resolvedSort = resolveSort(params.sort);

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
