"use client";

import { Award, Ban, Calendar, Package, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import AdminHeader from "./AdminHeader";
import { useSidebar } from "./AdminLayoutClient";

const quickLinks = [
  {
    title: "회원 관리",
    description: "회원 목록 조회 및 관리",
    icon: Users,
    href: "/admin/users",
    color: "bg-blue-500",
  },
  {
    title: "제품 관리",
    description: "제품 등록 및 수정",
    icon: Package,
    href: "/admin/products",
    color: "bg-green-500",
  },
  {
    title: "예약 관리",
    description: "예약 현황 및 승인",
    icon: Calendar,
    href: "/admin/reservations",
    color: "bg-amber-500",
  },
  {
    title: "멤버십 관리",
    description: "멤버십 혜택 설정",
    icon: Award,
    href: "/admin/membership",
    color: "bg-purple-500",
  },
  {
    title: "블랙리스트",
    description: "제재 회원 관리",
    icon: Ban,
    href: "/admin/blacklist",
    color: "bg-red-500",
  },
];

interface DashboardContentProps {
  statsSlot: ReactNode;
}

export default function DashboardContent({ statsSlot }: DashboardContentProps) {
  const { toggle } = useSidebar();

  return (
    <>
      <AdminHeader
        title="대시보드"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        {statsSlot}

        <h2 className="typo-bold-20 mb-4 text-gray-900">빠른 링크</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`${link.color} rounded-lg p-3 text-white transition-transform group-hover:scale-110`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
