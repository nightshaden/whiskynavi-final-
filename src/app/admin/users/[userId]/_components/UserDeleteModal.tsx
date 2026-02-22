"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUserAction } from "../../actions";

interface Props {
  isOpen: boolean;
  id: number;
  close: () => void;
}

const UserDeleteModal: FC<Props> = ({ isOpen, close, id }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(id);
      if (result.success) {
        close();
        router.push("/admin/users");
      } else {
        toast.error(result.error || "회원 삭제에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold">회원 삭제</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            이 회원을 삭제하시겠습니까? 회원 상태가 DELETED로 변경됩니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={close}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDeleteModal;
