"use client";

import type {
  BottleReservationNoticePublicResponse,
  PickupLocationResponse,
} from "@/apis/generated/api";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyReservation } from "../../actions";
import { useCountdownTimer } from "../../_lib/useCountdownTimer";
import ApplyForm from "../../_components/ApplyForm";
import InfoList from "../../_components/InfoList";
import StatusBadge from "../../_components/StatusBadge";
import TimerDisplay from "../../_components/TimerDisplay";

interface ReservationDetailClientProps {
  notice: BottleReservationNoticePublicResponse;
  pickupLocations: PickupLocationResponse[];
}

export default function ReservationDetailClient({
  notice,
  pickupLocations,
}: ReservationDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { timeRemaining, status } = useCountdownTimer(notice);

  const handleApply = (quantity: number, userBusinessId: number) => {
    setError(null);
    startTransition(async () => {
      const result = await applyReservation(notice.id!, quantity, userBusinessId);
      if (result.success) {
        router.push("/reservation");
        router.refresh();
      } else {
        setError(result.error ?? "예약 신청에 실패했습니다.");
      }
    });
  };

  return (
    <div className="border border-white/10 bg-white/5 p-4 lg:p-8">
      {/* Top: Image + Info */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:mb-8 lg:grid-cols-2 lg:gap-8">
        {/* Image */}
        <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="text-4xl text-white/60 lg:text-6xl">
            {notice.bottleName ?? ""}
          </div>
          <StatusBadge
            status={status}
            className="absolute top-2 right-2 lg:top-4 lg:right-4"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h3 className="typo-bold-20 lg:text-3xl mb-4 text-white lg:mb-6">
            {notice.bottleName}
          </h3>
          <InfoList notice={notice} />
        </div>
      </div>

      {/* Bottom: Timer + Action */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <TimerDisplay
          status={status}
          timeRemaining={timeRemaining}
          reservationStartAt={notice.reservationStartAt}
          reservationEndAt={notice.reservationEndAt}
        />

        <div className="flex flex-col">
          {status === "active" ? (
            <ApplyForm
              onApply={handleApply}
              isPending={isPending}
              error={error}
              pickupLocations={pickupLocations}
            />
          ) : status === "pending" ? (
            <button
              type="button"
              disabled
              className="typo-bold-16 lg:text-xl w-full cursor-not-allowed bg-gray-600 px-4 py-2.5 text-gray-400 transition-colors lg:px-6 lg:py-4"
            >
              예약 대기 중
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
