"use client";

import type { BottleReservationNoticePublicResponse } from "@/apis/generated/api";
import { useIsDesktop } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import ReservationCard from "./ReservationCard";

const ReservationDetailModal = dynamic(
  () => import("./ReservationDetailModal"),
);

interface RecentEndedSectionProps {
  notices: BottleReservationNoticePublicResponse[];
}

export default function RecentEndedSection({
  notices,
}: RecentEndedSectionProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  if (notices.length === 0) return null;

  const handleCardClick = (notice: BottleReservationNoticePublicResponse) => {
    if (isDesktop) {
      overlay.open(({ isOpen, close }) => (
        <ReservationDetailModal
          isOpen={isOpen}
          close={close}
          notice={notice}
        />
      ));
    } else {
      router.push(`/reservation/${notice.id}`);
    }
  };

  return (
    <div className="lg:px-8">
      <h2 className="mb-4 text-xl font-bold text-white lg:text-2xl">
        종료된 예약
      </h2>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
        {notices.map((notice) => (
          <ReservationCard
            key={notice.id}
            notice={notice}
            status="ended"
            onClick={() => handleCardClick(notice)}
          />
        ))}
      </div>
    </div>
  );
}
