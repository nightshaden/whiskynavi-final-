"use client";

import type { BottleReservationNoticePublicResponse } from "@/apis/generated/api";

type ReservationStatus = "active" | "ended";

interface ReservationCardProps {
  notice: BottleReservationNoticePublicResponse;
  status: ReservationStatus;
  onClick: () => void;
}

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  return dateStr.slice(0, 16).replace("T", " ");
};

export default function ReservationCard({
  notice,
  status,
  onClick,
}: ReservationCardProps) {
  const isActive = status === "active";

  return (
    <button
      type="button"
      className="group w-full cursor-pointer border-b border-white/10 pb-2 text-left transition-colors hover:bg-white/5"
      onClick={onClick}
    >
      {/* Image - Square */}
      <div className="relative mb-2 flex aspect-square items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
        {/* TODO: bottleId로 보틀 이미지 조회 연동 */}
        <div className="text-sm text-white/60">
          {notice.bottleName ?? ""}
        </div>
        {/* Status Badge */}
        <div
          className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white ${
            isActive ? "bg-blue-600" : "bg-gray-600"
          }`}
        >
          {isActive ? "진행 중" : "종료"}
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="mb-0.5 text-xs text-gray-400">
          {notice.bottleBrand ?? ""}
        </p>
        <h3 className="typo-medium-14 mb-1 line-clamp-2 text-white group-hover:text-gray-300">
          {notice.bottleName ?? ""}
        </h3>
        <div className="flex items-center justify-between">
          {notice.price != null && (
            <span className="text-xs text-gray-400">
              {notice.price.toLocaleString()}원
            </span>
          )}
          {notice.availableQuantity != null && (
            <span className="text-xs text-gray-500">
              {notice.availableQuantity}병
            </span>
          )}
        </div>
        {/* Reservation Date */}
        <div
          className={`mt-0.5 text-xs ${isActive ? "text-blue-400" : "text-gray-500"}`}
        >
          {isActive
            ? `마감: ${formatDate(notice.reservationEndAt)}`
            : `종료: ${formatDate(notice.reservationEndAt)}`}
        </div>
      </div>
    </button>
  );
}
