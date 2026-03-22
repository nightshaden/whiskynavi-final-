"use client";

import type { BottleReservationApplicationResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { Ban, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import Pagination from "../../../_components/Pagination";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
} from "../../../constants";
import ApplicationCancelModal from "./ApplicationCancelModal";
import ApplicationConfirmModal from "./ApplicationConfirmModal";
import ApplicationRejectModal from "./ApplicationRejectModal";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

interface ApplicationsTableSectionProps {
  noticeId: number;
  applications: BottleReservationApplicationResponse[];
  totalElements: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function ApplicationsTableSection({
  noticeId,
  applications,
  totalElements,
  currentPage,
  itemsPerPage,
}: ApplicationsTableSectionProps) {
  const router = useRouter();

  const handleConfirm = (app: BottleReservationApplicationResponse) => {
    overlay.open((props) => (
      <ApplicationConfirmModal
        {...props}
        applicationId={app.id!}
        applicantName={app.applicantUser?.name ?? "알 수 없음"}
        requestedQuantity={app.quantity ?? 1}
      />
    ));
  };

  const handleReject = (app: BottleReservationApplicationResponse) => {
    overlay.open((props) => (
      <ApplicationRejectModal
        {...props}
        applicationId={app.id!}
        applicantName={app.applicantUser?.name ?? "알 수 없음"}
      />
    ));
  };

  const handleCancel = (app: BottleReservationApplicationResponse) => {
    overlay.open((props) => (
      <ApplicationCancelModal
        {...props}
        applicationId={app.id!}
        applicantName={app.applicantUser?.name ?? "알 수 없음"}
      />
    ));
  };

  const canConfirm = (status?: string) => status === "APPLIED";
  const canReject = (status?: string) => status === "APPLIED";
  const canCancel = (status?: string) =>
    status === "CONFIRMED" || status === "WAITING_PICKUP";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="font-bold text-gray-900">
          신청 목록{" "}
          <span className="typo-regular-14 text-gray-500">
            ({totalElements}건)
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                ID
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                신청자
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                연락처
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                픽업 업장
              </th>
              <th className="typo-bold-12 px-4 py-3 text-center text-gray-700 uppercase">
                신청수량
              </th>
              <th className="typo-bold-12 px-4 py-3 text-center text-gray-700 uppercase">
                확정수량
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                상태
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                신청일
              </th>
              <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  신청 내역이 없습니다.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{app.id}</td>
                  <td className="typo-medium-14 px-4 py-3 text-gray-900">
                    {app.applicantUser?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {app.applicantUser?.phone ?? "-"}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-sm text-gray-600">
                    {app.pickupBusiness?.businessName ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">
                    {app.quantity}
                  </td>
                  <td className="typo-medium-14 px-4 py-3 text-center text-amber-600">
                    {app.confirmedQuantity ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge
                      className={
                        RESERVATION_STATUS_COLOR[app.status ?? ""] ??
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {RESERVATION_STATUS_LABEL[app.status ?? ""] ?? app.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {canConfirm(app.status) && (
                        <button
                          type="button"
                          onClick={() => handleConfirm(app)}
                          className="cursor-pointer rounded-md p-1.5 text-green-600 transition-colors hover:bg-green-50"
                          title="확정"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {canReject(app.status) && (
                        <button
                          type="button"
                          onClick={() => handleReject(app)}
                          className="cursor-pointer rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          title="거절"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {canCancel(app.status) && (
                        <button
                          type="button"
                          onClick={() => handleCancel(app)}
                          className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                          title="취소"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={totalElements}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        searchParams={{}}
        basePath={`/admin/reservations/${noticeId}`}
      />
    </div>
  );
}
