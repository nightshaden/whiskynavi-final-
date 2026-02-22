"use client";

import type { BottleReservationNoticeResponse } from "@/apis/generated/api";
import { ROLE_LABEL_MAP } from "../../../constants";

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface NoticeInfoSectionProps {
  notice: BottleReservationNoticeResponse;
}

export default function NoticeInfoSection({ notice }: NoticeInfoSectionProps) {
  const fields = [
    { label: "공고 ID", value: notice.id },
    { label: "제품명", value: notice.bottleName },
    { label: "브랜드", value: notice.bottleBrand ?? "-" },
    { label: "가격", value: notice.price != null ? `${notice.price.toLocaleString()}원` : "-" },
    { label: "예약 시작", value: formatDateTime(notice.reservationStartAt) },
    { label: "예약 종료", value: formatDateTime(notice.reservationEndAt) },
    { label: "가용 수량", value: notice.availableQuantity ?? 0 },
    { label: "생성일", value: formatDateTime(notice.createdAt) },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <h3 className="font-bold text-gray-900 mb-4">공고 정보</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.label}>
            <span className="block text-xs text-gray-500 mb-1">{field.label}</span>
            <span className="text-sm text-gray-900 font-medium">{field.value}</span>
          </div>
        ))}
      </div>

      {notice.gradeConditions && notice.gradeConditions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="block text-xs text-gray-500 mb-2">등급 조건</span>
          <div className="flex flex-wrap gap-2">
            {notice.gradeConditions.map((gc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs"
              >
                {ROLE_LABEL_MAP[gc.requiredRole as keyof typeof ROLE_LABEL_MAP] ?? gc.requiredRole}
                {gc.applicableFrom && (
                  <span className="text-amber-500">
                    ({formatDateTime(gc.applicableFrom)}~)
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
