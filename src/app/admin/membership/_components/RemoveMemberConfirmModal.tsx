"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RemoveMemberConfirmModalProps {
  isOpen: boolean;
  close: () => void;
  userName: string;
  username: string;
  onConfirm: () => void;
}

export default function RemoveMemberConfirmModal({
  isOpen,
  close,
  userName,
  username,
  onConfirm,
}: RemoveMemberConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
              멤버십 해제
            </DialogTitle>
          </div>
          <p className="text-gray-700">
            <span className="font-bold text-gray-900">
              {userName}(@{username})
            </span>{" "}
            회원의 멤버십을 정말로{" "}
            <span className="font-bold text-red-600">해제</span>하시겠습니까?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            해제된 멤버십은 다시 추가할 수 있습니다.
          </p>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleConfirm}
          >
            해제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
