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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-bold">
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
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleConfirm}
          >
            교체
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
