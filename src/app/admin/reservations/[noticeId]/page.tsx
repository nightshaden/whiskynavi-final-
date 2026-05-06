import {
  type BottleReservationApplicationResponse,
  type BottleReservationNoticeResponse,
  type DeliveryCompanyResponse,
  type ReservationBusinessDeliveryResponse,
  getApiAdminBottlesReservationsApplications,
  getApiAdminBottlesReservationsNoticesNoticeid,
  getApiAdminReservationDeliveriesCompanies,
  getApiAdminReservationDeliveriesNoticesNoticeid,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import NoticeDetailContent from "./_components/NoticeDetailContent";

interface NoticeDetailPageProps {
  params: Promise<{ noticeId: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

async function getOptionalData<T>(request: Promise<{ data: T }>): Promise<T | undefined> {
  try {
    const response = await request;
    return response.data;
  } catch {
    return undefined;
  }
}

export default async function NoticeDetailPage({ params, searchParams }: NoticeDetailPageProps) {
  const { noticeId } = await params;
  const sp = await searchParams;
  const token = await getAuthToken();

  let notice: BottleReservationNoticeResponse | undefined;
  let applications: BottleReservationApplicationResponse[] = [];
  let applicationsTotalElements = 0;
  let deliveries: ReservationBusinessDeliveryResponse[] = [];
  let deliveryCompanies: DeliveryCompanyResponse[] = [];

  try {
    const [noticeRes, applicationsRes, deliveriesData, companiesData] = await Promise.all([
      getApiAdminBottlesReservationsNoticesNoticeid(Number(noticeId), withToken(token)),
      getApiAdminBottlesReservationsApplications(
        {
          noticeId: Number(noticeId),
          page: sp.page ? Number(sp.page) - 1 : 0,
          size: sp.limit ? Number(sp.limit) : 20,
        },
        withToken(token),
      ),
      getOptionalData(getApiAdminReservationDeliveriesNoticesNoticeid(Number(noticeId), withToken(token))),
      getOptionalData(getApiAdminReservationDeliveriesCompanies(withToken(token))),
    ]);

    notice = noticeRes.data;
    applications = applicationsRes.data.content ?? [];
    applicationsTotalElements = applicationsRes.data.totalElements ?? 0;
    deliveries = deliveriesData ?? [];
    deliveryCompanies = companiesData ?? [];
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[404]")) {
      notFound();
    }
    throw error;
  }

  return (
    <NoticeDetailContent
      notice={notice}
      applications={applications}
      applicationsTotalElements={applicationsTotalElements}
      applicationsPage={Number(sp.page) || 1}
      applicationsLimit={Number(sp.limit) || 20}
      deliveries={deliveries}
      deliveryCompanies={deliveryCompanies}
    />
  );
}
