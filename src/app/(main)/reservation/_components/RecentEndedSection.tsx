import type { BottleReservationNoticePublicResponse } from "@/apis/generated/api";
import Link from "next/link";
import ReservationCard from "./ReservationCard";

interface RecentEndedSectionProps {
  notices: BottleReservationNoticePublicResponse[];
}

export default function RecentEndedSection({ notices }: RecentEndedSectionProps) {
  if (notices.length === 0) return null;

  return (
    <div className="lg:px-8">
      <h2 className="typo-bold-20 mb-4 text-white lg:text-2xl">종료된 예약</h2>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {notices.map((notice) => (
          <Link key={notice.id} href={`/reservation/${notice.id}`}>
            <ReservationCard notice={notice} status="ended" />
          </Link>
        ))}
      </div>
    </div>
  );
}
