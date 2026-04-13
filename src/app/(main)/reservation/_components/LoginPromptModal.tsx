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
import { useRouter } from "next/navigation";

interface LoginPromptModalProps {
  isOpen: boolean;
  close: () => void;
}

export default function LoginPromptModal({ isOpen, close }: LoginPromptModalProps) {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="typo-bold-20">로그인이 필요합니다</DialogTitle>
          <DialogDescription className="pt-2 text-gray-600">
            예약 서비스를 이용하시려면 로그인이 필요합니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              close();
              router.push("/sign-in?callbackUrl=/reservation");
            }}
          >
            로그인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
