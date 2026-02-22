"use client";

import { ArrowLeft, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type {
  BottleAdminResponse,
  BottleReservationNoticeResponse,
} from "@/apis/generated/api";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import { updateNoticeFormAction } from "../../../actions";
import NoticeFormFields from "../../../new/_components/NoticeFormFields";

interface NoticeEditContentProps {
  notice: BottleReservationNoticeResponse;
  bottles: BottleAdminResponse[];
}

export default function NoticeEditContent({
  notice,
  bottles,
}: NoticeEditContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  const updateAction = updateNoticeFormAction.bind(null, notice.id as number);
  const [formState, formAction, isPending] = useActionState(updateAction, {
    success: false,
  });

  return (
    <>
      <AdminHeader
        title="예약 공고 편집"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <form action={formAction} className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push(`/admin/reservations/${notice.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft size={20} />
            공고 상세로 돌아가기
          </button>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-amber-600 text-white cursor-pointer rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {isPending ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/reservations/${notice.id}`)}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 text-gray-700 cursor-pointer rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <X size={16} />
              취소
            </button>
          </div>
        </div>

        {formState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {formState.error}
          </div>
        )}

        <NoticeFormFields defaultValues={notice} bottles={bottles} />
      </form>
    </>
  );
}
