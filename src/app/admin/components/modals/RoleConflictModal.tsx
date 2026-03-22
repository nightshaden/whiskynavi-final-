"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface RoleConflictModalProps {
  isOpen: boolean;
  close: () => void;
  message: string;
  onConfirm: () => void;
}

export default function RoleConflictModal({
  isOpen,
  close,
  message,
  onConfirm,
}: RoleConflictModalProps) {
  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <DialogTitle className="typo-bold-20">
              권한 교체 확인
            </DialogTitle>
          </div>
          <p className="text-gray-700">{message}</p>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button
            className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
            onClick={handleConfirm}
          >
            교체
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
