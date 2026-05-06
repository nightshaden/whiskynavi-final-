import { getApiAdminBusinessesMembers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessMembersContent from "./_components/BusinessMembersContent";
import { resolveBusinessMembersSort } from "./sort";

const resolveBooleanFilter = (value?: string) => {
  if (value === "Y") return true;
  if (value === "N") return false;
  return undefined;
};

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    businessType?: string;
    hasBusinessRole?: string;
    hasTrailntaleBusinessRole?: string;
    hasPickupRole?: string;
  }>;
}

export default async function BusinessMembersPage({ searchParams }: BusinessMembersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const resolvedSort = resolveBusinessMembersSort(params.sort);

  const res = await getApiAdminBusinessesMembers(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
      sort: [resolvedSort],
      businessType: params.businessType || undefined,
      hasBusinessRole: resolveBooleanFilter(params.hasBusinessRole),
      hasTrailntaleBusinessRole: resolveBooleanFilter(params.hasTrailntaleBusinessRole),
      hasPickupRole: resolveBooleanFilter(params.hasPickupRole),
    } as Parameters<typeof getApiAdminBusinessesMembers>[0] & {
      businessType?: string;
      hasBusinessRole?: boolean;
      hasTrailntaleBusinessRole?: boolean;
      hasPickupRole?: boolean;
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
