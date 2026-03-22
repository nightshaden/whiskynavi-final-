"use client";

import type { PageOrderResponse, UserSelfResponse } from "@/apis/generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsDesktop } from "@/hooks/use-media-query";
import { Building2, Crown, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { overlay } from "overlay-kit";
import { useState } from "react";
import BusinessApplyForm from "./BusinessApplyForm";
import FaqSection from "./FaqSection";
import MembershipTab from "./MembershipTab";
import OrdersTab from "./OrdersTab";
import UserProfileCard from "./UserProfileCard";
interface MyPageClientProps {
  user: UserSelfResponse;
  orders: PageOrderResponse;
}

export default function MyPageClient({ user, orders }: MyPageClientProps) {
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const initialTab =
    searchParams.get("tab") === "membership" ? "membership" : "orders";
  const [activeTab, setActiveTab] = useState<"orders" | "membership">(
    initialTab,
  );

  const handleTabChange = (tab: "orders" | "membership") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "orders") params.delete("page");
    window.history.replaceState(null, "", `/my-page?${params.toString()}`);
  };

  const handleBusinessRegister = () => {
    overlay.open(({ isOpen, close }) => {
      if (isDesktop) {
        return (
          <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>내 정보 수정</DialogTitle>
              </DialogHeader>
              <BusinessApplyForm />
            </DialogContent>
          </Dialog>
        );
      } else {
        return (
          <Drawer open={isOpen} onOpenChange={(open) => !open && close()}>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>내 정보 수정</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-4">
                <BusinessApplyForm />
              </div>
            </DrawerContent>
          </Drawer>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1d2429] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-3 md:mb-8">
          <h1 className="typo-bold-30 md:text-4xl text-white">
            마이페이지
          </h1>
        </div>

        {/* User Info Card */}
        <UserProfileCard user={user} />

        {/* Tabs */}
        <div className="mb-6 overflow-hidden border border-white/10 bg-white/5 md:mb-8">
          <div className="border-b border-white/10">
            <nav className="flex">
              <button
                onClick={() => handleTabChange("orders")}
                className={`flex-1 px-4 py-3 text-center text-sm font-semibold transition-colors md:px-6 md:py-4 md:text-base ${
                  activeTab === "orders"
                    ? "border-b-2 border-white text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Package
                  size={16}
                  className="mr-1 inline-block md:mr-2 md:size-5"
                />
                주문내역
              </button>
              <button
                onClick={() => handleTabChange("membership")}
                className={`flex-1 px-4 py-3 text-center text-sm font-semibold transition-colors md:px-6 md:py-4 md:text-base ${
                  activeTab === "membership"
                    ? "border-b-2 border-white text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Crown
                  size={16}
                  className="mr-1 inline-block md:mr-2 md:size-5"
                />
                나의 멤버십
              </button>
            </nav>
          </div>

          <div className="p-4 md:p-8">
            {activeTab === "orders" && <OrdersTab orders={orders} />}
            {activeTab === "membership" && <MembershipTab user={user} />}
          </div>
        </div>

        <div className="mb-6 border border-white/10 bg-white/5 p-4 md:mb-8 md:p-8">
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h3 className="typo-bold-20 md:text-2xl flex items-center gap-2 text-white">
              <Building2 size={24} className="text-white md:size-7" />
              사업자 등록
            </h3>
          </div>
          <div className="space-y-3 md:space-y-4">
            <p className="text-sm text-gray-400 md:text-base">
              사업자로 등록하시면 위스키 픽업 서비스 및 비즈니스 전용 혜택을
              받으실 수 있습니다.
            </p>
            <button
              onClick={handleBusinessRegister}
              className="typo-bold-14 md:text-base bg-white px-6 py-3 text-gray-900 transition-colors hover:bg-gray-100"
            >
              사업자 등록하기
            </button>
          </div>
        </div>
        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  );
}
