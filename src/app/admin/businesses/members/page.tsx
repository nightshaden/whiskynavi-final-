import { getApiAdminBusinessesMembers, type GetApiAdminBusinessesMembersBusinessType } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessMembersContent from "./_components/BusinessMembersContent";
import { resolveBusinessMembersSort } from "./sort";

const BUSINESS_MEMBER_SEARCH_FIELDS = ["businessName", "userName"] as const;

type BusinessMemberSearchField = (typeof BUSINESS_MEMBER_SEARCH_FIELDS)[number];

function resolveSearchField(searchField?: string): BusinessMemberSearchField {
  return BUSINESS_MEMBER_SEARCH_FIELDS.find((field) => field === searchField) ?? "businessName";
}

function resolveBusinessTypeFilter(value?: string): GetApiAdminBusinessesMembersBusinessType | undefined {
  if (value === "HOUSEHOLD" || value === "ENTERTAINMENT") return value;
  return undefined;
}

function resolveBooleanFilter(value?: string) {
  if (value === "Y") return true;
  if (value === "N") return false;
  return undefined;
}

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    searchField?: string;
    businessType?: string;
    hasBusinessRole?: string;
    hasTrailntaleBusinessRole?: string;
    hasCommunityBusinessRole?: string;
    hasPickupRole?: string;
  }>;
}

export default async function BusinessMembersPage({ searchParams }: BusinessMembersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const resolvedSort = resolveBusinessMembersSort(params.sort);
  const searchField = resolveSearchField(params.searchField);
  const keyword = params.q || undefined;

  const res = await getApiAdminBusinessesMembers(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
      sort: [resolvedSort],
      businessName: searchField === "businessName" ? keyword : undefined,
      userName: searchField === "userName" ? keyword : undefined,
      businessType: resolveBusinessTypeFilter(params.businessType),
      hasBusinessRole: resolveBooleanFilter(params.hasBusinessRole),
      hasTrailntaleBusinessRole: resolveBooleanFilter(params.hasTrailntaleBusinessRole),
      hasCommunityBusinessRole: resolveBooleanFilter(params.hasCommunityBusinessRole),
      hasPickupRole: resolveBooleanFilter(params.hasPickupRole),
    },
    withToken(token),
  );

  return (
    <BusinessMembersContent
      searchParams={{
        ...params,
        sort: resolvedSort,
        searchField,
      }}
      members={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
