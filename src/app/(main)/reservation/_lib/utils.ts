import type { BottleReservationNoticePublicResponse } from "@/apis/generated/api";

export type NoticeStatus = "pending" | "active" | "closed";

export function getNoticeStatus(
  notice: BottleReservationNoticePublicResponse,
): NoticeStatus {
  const now = new Date();
  const start = notice.reservationStartAt
    ? new Date(notice.reservationStartAt)
    : null;
  const end = notice.reservationEndAt
    ? new Date(notice.reservationEndAt)
    : null;

  if (end && now > end) return "closed";
  if (start && now < start) return "pending";
  return "active";
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date
    .toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\. /g, "-")
    .replace(".", "")
    .replace(", ", " ");
}

export function calculateTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return "00일 00시간 00분 00초";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(days).padStart(2, "0")}일 ${String(hours).padStart(2, "0")}시간 ${String(minutes).padStart(2, "0")}분 ${String(seconds).padStart(2, "0")}초`;
}

export function getStatusBadge(status: NoticeStatus) {
  switch (status) {
    case "closed":
      return { label: "종료", className: "bg-gray-600" };
    case "pending":
      return { label: "예약 대기 중", className: "bg-orange-600" };
    case "active":
      return { label: "예약 진행 중", className: "bg-blue-600" };
  }
}

export function buildInfoItems(notice: BottleReservationNoticePublicResponse) {
  return [
    { label: "브랜드", value: notice.bottleBrand },
    {
      label: "가격",
      value: notice.price != null ? `${notice.price.toLocaleString()}원` : null,
    },
    {
      label: "가용 수량",
      value:
        notice.availableQuantity != null
          ? `${notice.availableQuantity}병`
          : null,
    },
  ].filter(
    (item): item is { label: string; value: string } => item.value != null,
  );
}
