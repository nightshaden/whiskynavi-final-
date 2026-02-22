"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();

  const handleCancel = () => {
    startTransition(async () => {
      const result = await cancelApplicationAction(applicationId);
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
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-gray-600" />
            </div>
            <DialogTitle>신청 취소</DialogTitle>
          </div>
          <DialogDescription>
            <strong>{applicantName}</strong>님의 신청을 취소하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={isPending}>
            닫기
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "취소 확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
