import { type GetApiAdminBusinessesApplicationsStatus, getApiAdminBusinessesApplications } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { parseApiPage } from "@/lib/page-response";
import BusinessApplicationsContent from "./_components/BusinessApplicationsContent";

interface BusinessApplicationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
}

export default async function BusinessApplicationsPage({ searchParams }: BusinessApplicationsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const res = await getApiAdminBusinessesApplications(
    {
      page: parseApiPage(params.page),
      size: params.limit ? Number(params.limit) : 20,
      ...(params.status
        ? {
            status: params.status as GetApiAdminBusinessesApplicationsStatus,
          }
        : {}),
    },
    withToken(token),
  );

  return (
    <BusinessApplicationsContent
      searchParams={params}
      applications={res.data.content ?? []}
      totalElements={res.data.page?.totalElements ?? 0}
    />
  );
}
