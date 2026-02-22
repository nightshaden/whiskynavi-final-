"use client";

import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import type { AdminUserResponse, AdminUserOrderSummaryResponse } from "@/apis/generated/api";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import AdminUserDetailSection from "../../../components/AdminUserDetailSection";
import UserDeleteModal from "./UserDeleteModal";

interface UserDetailContentProps {
  user: AdminUserResponse;
  orderSummary: AdminUserOrderSummaryResponse;
}

export default function UserDetailContent({ user, orderSummary }: UserDetailContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  return (
    <>
      <AdminHeader
        title="회원 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft size={20} />
            회원 목록으로 돌아가기
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <Edit2 size={14} />
              수정
            </button>
            <button
              type="button"
              onClick={() =>
                overlay.open((props) => (
                  <UserDeleteModal {...props} id={user.id!} />
                ))
              }
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={14} />
              삭제
            </button>
          </div>
        </div>
        <AdminUserDetailSection
          isEditMode={false}
          userDetails={user}
          orderSummary={orderSummary}
        />
      </div>
    </>
  );
}
