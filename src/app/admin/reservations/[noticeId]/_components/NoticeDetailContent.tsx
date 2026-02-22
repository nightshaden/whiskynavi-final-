"use client";

import { ArrowLeft, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  BottleReservationNoticeResponse,
  BottleReservationApplicationResponse,
} from "@/apis/generated/api";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import NoticeInfoSection from "./NoticeInfoSection";
import ApprovalSummarySection from "./ApprovalSummarySection";
import ApplicationsTableSection from "./ApplicationsTableSection";

interface NoticeDetailContentProps {
  notice?: BottleReservationNoticeResponse;
  applications: BottleReservationApplicationResponse[];
  applicationsTotalElements: number;
  applicationsPage: number;
  applicationsLimit: number;
}

export default function NoticeDetailContent({
  notice,
  applications,
  applicationsTotalElements,
  applicationsPage,
  applicationsLimit,
}: NoticeDetailContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  if (!notice) return null;

  return (
    <>
      <AdminHeader
        title="예약 공고 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/reservations")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            공고 목록으로 돌아가기
          </button>

          <button
            type="button"
            onClick={() => router.push(`/admin/reservations/${notice.id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium cursor-pointer"
          >
            <Edit2 size={16} />
            편집
          </button>
        </div>

        <NoticeInfoSection notice={notice} />

        <ApprovalSummarySection notice={notice} />

        <ApplicationsTableSection
          noticeId={notice.id!}
          applications={applications}
          totalElements={applicationsTotalElements}
          currentPage={applicationsPage}
          itemsPerPage={applicationsLimit}
        />
      </div>
    </>
  );
}
