"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Package, Crown } from "lucide-react";
import type { UserSelfResponse, PageOrderResponse } from "@/apis/generated/api";
import UserProfileCard from "./UserProfileCard";
import OrdersTab from "./OrdersTab";
import MembershipTab from "./MembershipTab";
import FaqSection from "./FaqSection";

interface MyPageClientProps {
  user: UserSelfResponse;
  orders: PageOrderResponse;
}

export default function MyPageClient({ user, orders }: MyPageClientProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "membership" ? "membership" : "orders";
  const [activeTab, setActiveTab] = useState<"orders" | "membership">(initialTab);

  const handleTabChange = (tab: "orders" | "membership") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "orders") params.delete("page");
    window.history.replaceState(null, "", `/my-page?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#1d2429] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-3 md:mb-8">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
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

        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  );
}
