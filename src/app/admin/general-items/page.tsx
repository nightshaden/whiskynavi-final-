import { getApiAdminItems } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { parseApiPage } from "@/lib/page-response";
import GeneralItemsContent from "./_components/GeneralItemsContent";

interface GeneralItemsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
  }>;
}

export default async function GeneralItemsPage({ searchParams }: GeneralItemsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const itemsPerPage = params.limit ? Number(params.limit) : 20;

  const res = await getApiAdminItems(
    {
      page: parseApiPage(params.page),
      size: itemsPerPage,
      keyword: params.q || undefined,
      sort: ["createdAt,desc"],
    },
    withToken(token),
  );

  return (
    <GeneralItemsContent
      searchParams={params}
      items={res.data.content ?? []}
      totalElements={res.data.page?.totalElements ?? 0}
    />
  );
}
