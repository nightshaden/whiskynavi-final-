import {
  type GetApiUsersBusinessesPickupReservationsApplicationsStatus,
  getApiUsersBusinessesPickupReservationsApplications,
  getApiUsersBusinessesReservationDeliveries,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import PickupNoticeApplicationsContent from "../../_components/PickupNoticeApplicationsContent";

interface PickupNoticeApplicationsPageProps {
  params: Promise<{
    noticeId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
}

async function getOptionalData<T>(request: Promise<{ data: T }>): Promise<T | undefined> {
  try {
    const response = await request;
    return response.data;
  } catch {
    return undefined;
  }
}

export default async function PickupNoticeApplicationsPage({
  params,
  searchParams,
}: PickupNoticeApplicationsPageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const token = await getAuthToken();
  const noticeId = Number(routeParams.noticeId);
  const currentPage = query.page ? Number(query.page) : 1;
  const pageSize = query.limit ? Number(query.limit) : 20;

  const [applicationsRes, deliveriesData] = await Promise.all([
    getApiUsersBusinessesPickupReservationsApplications(
      {
        noticeId,
        page: currentPage - 1,
        size: pageSize,
        ...(query.status
          ? {
              status: query.status as GetApiUsersBusinessesPickupReservationsApplicationsStatus,
            }
          : {}),
      },
      withToken(token),
    ),
    getOptionalData(getApiUsersBusinessesReservationDeliveries({ noticeId }, withToken(token))),
  ]);

  return (
    <PickupNoticeApplicationsContent
      noticeId={noticeId}
      searchParams={query}
      applications={applicationsRes.data.content ?? []}
      totalElements={applicationsRes.data.totalElements ?? 0}
      deliveries={deliveriesData ?? []}
    />
  );
}
