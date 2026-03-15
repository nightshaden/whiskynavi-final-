"use client";

import type { UserSelfResponse } from "@/apis/generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileEditForm from "./ProfileEditForm";

interface ProfileEditModalProps {
  isOpen: boolean;
  close: () => void;
  user: UserSelfResponse;
}

export default function ProfileEditModal({
  isOpen,
  close,
  user,
}: ProfileEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>내 정보 수정</DialogTitle>
        </DialogHeader>
        <ProfileEditForm user={user} onClose={close} />
      </DialogContent>
    </Dialog>
  );
}
