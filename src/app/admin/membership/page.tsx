import type { AdminUserResponse } from "@/apis/generated/api";
import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { parseApiPage } from "@/lib/page-response";
import MembershipContent from "./_components/MembershipContent";

interface MembershipPageProps {
  searchParams: Promise<{
    brand?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}

const BRAND_ROLE_MAP = {
  navi: "ROLE_WHISKYNAVI_MEMBER",
  tales: "ROLE_WHISKYTALES_MEMBER",
} as const;

export default async function MembershipPage({ searchParams }: MembershipPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const brand = (params.brand === "tales" ? "tales" : "navi") as "navi" | "tales";

  const res = await getApiAdminUsers(
    {
      page: parseApiPage(params.page),
      size: params.limit ? Number(params.limit) : 20,
      role: BRAND_ROLE_MAP[brand],
      sort: [`${params.sortBy || "createdAt"},${params.sortDirection || "desc"}`],
    },
    withToken(token),
  );

  return (
    <MembershipContent
      searchParams={params}
      brand={brand}
      users={(res.data.content ?? []) as AdminUserResponse[]}
      totalElements={res.data.page?.totalElements ?? 0}
    />
  );
}
