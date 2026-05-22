import { getApiAdminItems } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
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

  const currentPage = params.page ? Number(params.page) : 1;
  const itemsPerPage = params.limit ? Number(params.limit) : 20;

  const res = await getApiAdminItems(
    {
      page: Math.max(0, currentPage - 1),
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
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
