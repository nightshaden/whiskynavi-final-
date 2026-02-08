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

interface AdminConfirmModalProps {
  isOpen: boolean;
  close: () => void;
  userName: string;
  username: string;
  onConfirm: () => void;
}

export default function AdminConfirmModal({
  isOpen,
  close,
  userName,
  username,
  onConfirm,
}: AdminConfirmModalProps) {
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
              관리자 권한 추가
            </DialogTitle>
          </div>
          <p className="text-gray-700">
            <span className="font-bold text-gray-900">
              {userName}({username})
            </span>{" "}
            회원을
            <br />
            정말로 <span className="font-bold text-red-600">관리자</span>로
            등록하시겠습니까?
          </p>
          <p className="text-sm text-red-600 mt-2">
            관리자는 모든 회원 정보와 시스템을 관리할 수 있습니다.
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
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
