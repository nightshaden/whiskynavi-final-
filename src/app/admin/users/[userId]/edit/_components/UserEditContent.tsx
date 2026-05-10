"use client";

import type { AdminUserResponse } from "@/apis/generated/api";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import AdminUserDetailSection from "../../../../components/AdminUserDetailSection";
import {
  addUserRolesAction,
  removeUserRolesAction,
  replaceUserRoleAction,
  updateUserStatusAction,
} from "../../../actions";

interface UserEditContentProps {
  user: AdminUserResponse;
}

export default function UserEditContent({ user }: UserEditContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusToggle = (newStatus: string) => {
    startTransition(async () => {
      const result = await updateUserStatusAction(user.id!, newStatus);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleAddRole = (role: string) => {
    startTransition(async () => {
      const result = await addUserRolesAction(user.id!, [role]);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleRemoveRole = (role: string) => {
    startTransition(async () => {
      const result = await removeUserRolesAction(user.id!, [role]);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleReplaceRole = (oldRole: string, newRole: string) => {
    startTransition(async () => {
      const result = await replaceUserRoleAction(user.id!, oldRole, newRole);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <AdminHeader title="회원 정보 수정" onToggleSidebar={toggle} showSearch={false} />

      <div className="p-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          회원 상세로 돌아가기
        </button>

        <AdminUserDetailSection
          isEditMode
          userDetails={user}
          onStatusToggle={handleStatusToggle}
          onAddRole={handleAddRole}
          onRemoveRole={handleRemoveRole}
          onReplaceRole={handleReplaceRole}
          isSaving={isPending}
        />
      </div>
    </>
  );
}
