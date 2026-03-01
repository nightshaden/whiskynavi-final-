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
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { rejectApplicationAction } from "../../actions";

interface ApplicationRejectModalProps {
  isOpen: boolean;
  close: () => void;
  applicationId: number;
  applicantName: string;
}

export default function ApplicationRejectModal({
  isOpen,
  close,
  applicationId,
  applicantName,
}: ApplicationRejectModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectApplicationAction(applicationId);
      if (result.success) {
        close();
        router.refresh();
      } else {
        toast.error(result.error || "거절에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <DialogTitle>신청 거절</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{applicantName}</strong>님의 신청을 거절하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "거절"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
