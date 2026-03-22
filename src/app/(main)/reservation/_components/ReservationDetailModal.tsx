"use client";

import type {
  BottleReservationNoticePublicResponse,
  PickupLocationResponse,
} from "@/apis/generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { applyReservation } from "../actions";
import { useCountdownTimer } from "../_lib/useCountdownTimer";
import ApplyForm from "./ApplyForm";
import InfoList from "./InfoList";
import StatusBadge from "./StatusBadge";
import TimerDisplay from "./TimerDisplay";

interface ReservationDetailModalProps {
  isOpen: boolean;
  close: () => void;
  notice: BottleReservationNoticePublicResponse;
  pickupLocations?: PickupLocationResponse[];
}

export default function ReservationDetailModal({
  isOpen,
  close,
  notice,
  pickupLocations,
}: ReservationDetailModalProps) {
  const router = useRouter();
  const { timeRemaining, status } = useCountdownTimer(notice);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApply = (quantity: number, userBusinessId: number) => {
    setError(null);
    startTransition(async () => {
      const result = await applyReservation(notice.id!, quantity, userBusinessId);
      if (result.success) {
        close();
        router.refresh();
      } else {
        setError(result.error ?? "예약 신청에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#1d2429] p-0 sm:max-w-5xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{notice.bottleName ?? "예약 상세"}</DialogTitle>
          <DialogDescription>예약 상세 정보</DialogDescription>
        </DialogHeader>

        <div className="p-4 lg:p-8">
          {/* Top: Image + Info */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:mb-8 lg:grid-cols-2 lg:gap-8">
            <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div className="text-4xl text-white/60 lg:text-6xl">
                {notice.bottleName ?? ""}
              </div>
              <StatusBadge
                status={status}
                className="absolute top-2 right-2 lg:top-4 lg:right-4"
              />
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="typo-bold-20 lg:text-3xl mb-3 text-white lg:mb-6">
                {notice.bottleName}
              </h3>
              <InfoList notice={notice} />
            </div>
          </div>

          {/* Bottom: Timer + Action */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
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
                  pickupLocations={pickupLocations ?? []}
                />
              ) : status === "pending" ? (
                <div className="flex h-full flex-col justify-end">
                  <button
                    type="button"
                    disabled
                    className="typo-bold-16 lg:text-xl w-full cursor-not-allowed bg-gray-600 px-4 py-2.5 text-gray-400 transition-colors lg:px-6 lg:py-4"
                  >
                    예약 대기 중
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
