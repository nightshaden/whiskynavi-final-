import { getApiAdminBanners } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { parseApiPage } from "@/lib/page-response";
import BannersContent from "./_components/BannersContent";

interface BannersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function BannersPage({ searchParams }: BannersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const page = parseApiPage(params.page);
  const size = params.limit ? Number(params.limit) : 12;

  const res = await getApiAdminBanners({ page, size }, withToken(token));

  return (
    <BannersContent
      searchParams={params}
      banners={res.data.content ?? []}
      totalElements={res.data.page?.totalElements ?? 0}
    />
  );
}
