"use client";

import { Crown, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import type { UserSelfResponse } from "@/apis/generated/api";
import { useIsDesktop } from "@/hooks/use-media-query";
import { overlay } from "overlay-kit";
import { hasNaviMembership, hasTalesMembership } from "../_lib/utils";
import ProfileEditModal from "./ProfileEditModal";

interface UserProfileCardProps {
  user: UserSelfResponse;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const isDesktop = useIsDesktop();

  const handleEditProfile = () => {
    if (isDesktop) {
      overlay.open(({ isOpen, close }) => (
        <ProfileEditModal isOpen={isOpen} close={close} user={user} />
      ));
    } else {
      // 모바일에서도 모달로 처리 (별도 페이지 미존재)
      overlay.open(({ isOpen, close }) => (
        <ProfileEditModal isOpen={isOpen} close={close} user={user} />
      ));
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="mb-6 border border-white/10 bg-white/5 p-4 text-white md:mb-8 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="w-full md:w-auto">
          <div className="mb-2 flex items-center gap-3">
            <User size={28} className="md:size-8" />
            <h2 className="text-2xl font-bold md:text-3xl">
              {user.name}님
            </h2>
            <button
              onClick={handleEditProfile}
              className="border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/20 md:px-3 md:py-1.5 md:text-sm"
            >
              내 정보
            </button>
          </div>
          <p className="text-sm text-white/90 md:text-base">
            @{user.username}
          </p>
          <p className="text-xs text-white/60 md:text-sm">{user.email}</p>
        </div>
        <div className="w-full md:w-auto md:text-right">
          <div className="mb-2 flex flex-wrap items-center gap-2 md:mb-3 md:gap-3">
            {hasNaviMembership(user.roles) && (
              <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 text-gray-900 md:px-3 md:py-1.5">
                <Crown size={14} className="md:size-4" />
                <span className="text-xs font-bold">NAVI</span>
              </div>
            )}
            {hasTalesMembership(user.roles) && (
              <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 text-gray-900 md:px-3 md:py-1.5">
                <Crown size={14} className="md:size-4" />
                <span className="text-xs font-bold">TALES</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
            >
              <LogOut size={16} className="md:size-[18px]" />
              <span className="hidden md:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
