import {
  type BottleReservationNoticeResponse,
  getApiAdminBottlesReservationsNoticesNoticeid,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import NoticeEditContent from "./_components/NoticeEditContent";

interface NoticeEditPageProps {
  params: Promise<{ noticeId: string }>;
}

export default async function NoticeEditPage({ params }: NoticeEditPageProps) {
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

  return <NoticeEditContent notice={notice} />;
}
