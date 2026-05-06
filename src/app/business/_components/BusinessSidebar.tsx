"use client";

import { ClipboardList, Home, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/business/pickup-reservations",
    label: "공고 별 관리",
    description: "공고 기준 신청 현황",
    icon: Layers,
  },
  {
    href: "/business/pickup-reservations/applications",
    label: "예약 건 별 조회",
    description: "신청 건 단위 목록",
    icon: ClipboardList,
  },
];

export default function BusinessSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-5">
        <p className="text-xs font-bold tracking-wide text-amber-600">PICKUP BUSINESS</p>
        <h1 className="mt-1 text-lg font-bold text-gray-900">픽업 사업장</h1>
      </div>

      <nav className="space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isApplicationsPath = pathname.startsWith("/business/pickup-reservations/applications");
          const isActive =
            item.href === "/business/pickup-reservations"
              ? pathname.startsWith(item.href) && !isApplicationsPath
              : isApplicationsPath;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start gap-3 rounded-md px-3 py-3 transition-colors ${
                isActive ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="mt-0.5 block text-xs opacity-75">{item.description}</span>
              </span>
            </Link>
          );
        })}

        {/* 일반 페이지로 돌아가기 */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Home size={18} className="shrink-0" />
            <span className="text-sm font-bold">일반 페이지로 돌아가기</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
