"use client";

import type { BottleReservationNoticeResponse } from "@/apis/generated/api";

interface ApprovalSummarySectionProps {
  notice: BottleReservationNoticeResponse;
}

export default function ApprovalSummarySection({
  notice,
}: ApprovalSummarySectionProps) {
  const applied = notice.appliedQuantity ?? 0;
  const approved = notice.approvedQuantity ?? 0;
  const available = notice.availableQuantity ?? 0;

  const ratio = available > 0 ? (approved / available) * 100 : 0;
  const barColor =
    ratio >= 100
      ? "bg-red-500"
      : ratio > 80
        ? "bg-amber-500"
        : "bg-green-500";
  const textColor =
    ratio >= 100
      ? "text-red-600"
      : ratio > 80
        ? "text-amber-600"
        : "text-green-600";

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">승인 현황</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            총 {applied}건 신청
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${textColor}`}>
            {approved}{" "}
            <span className="text-sm text-gray-500">/ {available}병</span>
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {available > 0 ? ratio.toFixed(1) : "0.0"}% 승인됨
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(ratio, 100)}%` }}
        />
      </div>
    </div>
  );
}
