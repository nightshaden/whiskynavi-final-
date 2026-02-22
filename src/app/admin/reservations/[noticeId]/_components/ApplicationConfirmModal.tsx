"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { confirmApplicationAction } from "../../actions";

interface ApplicationConfirmModalProps {
  isOpen: boolean;
  close: () => void;
  applicationId: number;
  applicantName: string;
  requestedQuantity: number;
}

export default function ApplicationConfirmModal({
  isOpen,
  close,
  applicationId,
  applicantName,
  requestedQuantity,
}: ApplicationConfirmModalProps) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(requestedQuantity);
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmApplicationAction(applicationId, quantity);
      if (result.success) {
        close();
        router.refresh();
      } else {
        toast.error(result.error || "확정에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={24} className="text-green-600" />
            </div>
            <DialogTitle>신청 확정</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{applicantName}</strong>님의 신청을 확정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            확정 수량
          </label>
          <input
            type="number"
            min={1}
            max={requestedQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            신청 수량: {requestedQuantity}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || quantity < 1 || quantity > requestedQuantity}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending ? "처리 중..." : "확정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
