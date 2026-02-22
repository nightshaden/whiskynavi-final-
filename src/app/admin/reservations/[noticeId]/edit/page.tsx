import { notFound } from "next/navigation";
import {
  type BottleAdminResponse,
  type BottleReservationNoticeResponse,
  getApiAdminBottles,
  getApiAdminBottlesReservationsNoticesNoticeid,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import NoticeEditContent from "./_components/NoticeEditContent";

interface NoticeEditPageProps {
  params: Promise<{ noticeId: string }>;
}

export default async function NoticeEditPage({
  params,
}: NoticeEditPageProps) {
  const { noticeId } = await params;
  const token = await getAuthToken();

  let notice: BottleReservationNoticeResponse | undefined;
  try {
    const res = await getApiAdminBottlesReservationsNoticesNoticeid(
      Number(noticeId),
      withToken(token),
    );
    notice = res.data;
  } catch {
    notFound();
  }

  let bottles: BottleAdminResponse[] = [];
  try {
    const res = await getApiAdminBottles(
      { filters: { reservationStatus: "NO_RESERVATION", pageSize: 1000 } },
      withToken(token),
    );
    bottles = res.data.content ?? [];
  } catch {
    /* empty */
  }

  //NOTE: 현재 공고의 bottle이 NO_RESERVATION 목록에 없을 수 있으므로 병합
  if (
    notice.bottleId != null &&
    !bottles.some((b) => b.id === notice.bottleId)
  ) {
    bottles = [
      { id: notice.bottleId, name: notice.bottleName },
      ...bottles,
    ];
  }

  return <NoticeEditContent notice={notice} bottles={bottles} />;
}
