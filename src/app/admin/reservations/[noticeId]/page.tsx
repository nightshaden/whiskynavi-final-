import {
  type BottleReservationNoticeResponse,
  getApiAdminBottlesReservationsApplications,
  getApiAdminBottlesReservationsNoticesNoticeid,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import NoticeDetailContent from "./_components/NoticeDetailContent";

interface NoticeDetailPageProps {
  params: Promise<{ noticeId: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function NoticeDetailPage({
  params,
  searchParams,
}: NoticeDetailPageProps) {
  const { noticeId } = await params;
  const sp = await searchParams;
  const token = await getAuthToken();

  let notice: BottleReservationNoticeResponse | undefined;
  try {
    const [noticeRes, applicationsRes] = await Promise.all([
      getApiAdminBottlesReservationsNoticesNoticeid(
        Number(noticeId),
        withToken(token),
      ),
      getApiAdminBottlesReservationsApplications(
        {
          noticeId: Number(noticeId),
          page: sp.page ? Number(sp.page) - 1 : 0,
          size: sp.limit ? Number(sp.limit) : 20,
        },
        withToken(token),
      ),
    ]);

    notice = noticeRes.data;

    return (
      <NoticeDetailContent
        notice={notice}
        applications={applicationsRes.data.content ?? []}
        applicationsTotalElements={applicationsRes.data.totalElements ?? 0}
        applicationsPage={Number(sp.page) || 1}
        applicationsLimit={Number(sp.limit) || 20}
      />
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[404]")) {
      notFound();
    }
    throw error;
  }
}
