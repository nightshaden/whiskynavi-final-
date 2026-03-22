import { getApiBanners } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
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

  const page = params.page ? Number(params.page) - 1 : 0;
  const size = params.limit ? Number(params.limit) : 12;

  const res = await getApiBanners({ page, size }, withToken(token));

  return (
    <BannersContent
      searchParams={params}
      banners={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
