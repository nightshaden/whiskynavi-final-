"use client";

import type { UserSelfResponse } from "@/apis/generated/api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ProfileEditForm from "./ProfileEditForm";

interface ProfileEditDrawerProps {
  isOpen: boolean;
  close: () => void;
  user: UserSelfResponse;
}

export default function ProfileEditDrawer({
  isOpen,
  close,
  user,
}: ProfileEditDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>내 정보 수정</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">
          <ProfileEditForm user={user} onClose={close} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
