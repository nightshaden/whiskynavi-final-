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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { cancelApplicationAction } from "../../actions";

interface ApplicationCancelModalProps {
  isOpen: boolean;
  close: () => void;
  applicationId: number;
  applicantName: string;
}

export default function ApplicationCancelModal({
  isOpen,
  close,
  applicationId,
  applicantName,
}: ApplicationCancelModalProps) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleCancel = () => {
    startTransition(async () => {
      const trimmedReason = reason.trim();
      const result = await cancelApplicationAction(applicationId, trimmedReason ? { reason: trimmedReason } : {});
      if (result.success) {
        close();
        router.refresh();
      } else {
        toast.error(result.error || "취소에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <AlertTriangle size={24} className="text-gray-600" />
            </div>
            <DialogTitle>신청 취소</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{applicantName}</strong>님의 신청을 취소하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="reservation-cancel-reason">취소 사유</Label>
          <Textarea
            id="reservation-cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="비워두면 기본 시스템 사유가 사용됩니다."
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            닫기
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isPending}>
            {isPending ? "처리 중..." : "취소 확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
