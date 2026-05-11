"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { autoConfirmApplicationsAction } from "../../actions";

interface ApplicationAutoConfirmModalProps {
  isOpen: boolean;
  close: () => void;
  noticeId: number;
}

export default function ApplicationAutoConfirmModal({ isOpen, close, noticeId }: ApplicationAutoConfirmModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAutoConfirm = () => {
    startTransition(async () => {
      const result = await autoConfirmApplicationsAction(noticeId);

      if (result.success) {
        const confirmedCount = result.data?.confirmedApplicationCount ?? 0;
        const rejectedCount = result.data?.rejectedApplicationCount ?? 0;

        toast.success(`자동 승인배정 완료: 확정 ${confirmedCount}건, 거절 ${rejectedCount}건`);
        close();
        router.refresh();
      } else {
        toast.error(result.error || "자동 승인배정에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Sparkles size={24} className="text-amber-600" />
            </div>
            <DialogTitle>우선순위최대다수최대행복배정</DialogTitle>
          </div>
          <DialogDescription>
            이 공고의 대기 중 예약 신청을 자동 승인배정합니다. 처리 후 신청 상태와 확정 수량이 즉시 변경됩니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            취소
          </Button>
          <Button
            onClick={handleAutoConfirm}
            disabled={isPending}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            {isPending ? "처리 중..." : "자동 승인배정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
