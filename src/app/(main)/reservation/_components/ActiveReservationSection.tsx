"use client";

import type {
  BottleReservationNoticePublicResponse,
  PickupLocationResponse,
} from "@/apis/generated/api";
import { useIsDesktop } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import ReservationCard from "./ReservationCard";

const ReservationDetailModal = dynamic(
  () => import("./ReservationDetailModal"),
);

interface ActiveReservationSectionProps {
  notices: BottleReservationNoticePublicResponse[];
  pickupLocations: PickupLocationResponse[];
}

export default function ActiveReservationSection({
  notices,
  pickupLocations,
}: ActiveReservationSectionProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const handleCardClick = (notice: BottleReservationNoticePublicResponse) => {
    if (isDesktop) {
      overlay.open(({ isOpen, close }) => (
        <ReservationDetailModal
          isOpen={isOpen}
          close={close}
          notice={notice}
          pickupLocations={pickupLocations}
        />
      ));
    } else {
      router.push(`/reservation/${notice.id}`);
    }
  };

  return (
    <div className="mb-10 lg:border lg:border-white/10 lg:px-8 lg:pt-6 lg:pb-8">
      <h2 className="typo-bold-20 mb-4 text-white lg:text-2xl">
        현재 진행 중인 예약
      </h2>
      {notices.length === 0 ? (
        <div className="border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-gray-400">
          현재 진행 중인 예약 공고가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
          {notices.map((notice) => (
            <ReservationCard
              key={notice.id}
              notice={notice}
              status="active"
              onClick={() => handleCardClick(notice)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
