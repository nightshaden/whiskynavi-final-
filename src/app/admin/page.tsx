"use client";

import { useSidebar } from "./_components/AdminLayoutClient";
import AdminHeader from "./_components/AdminHeader";
import { stats } from "./_data/mockData";
import { Users, Package, Calendar, Award, Ban, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { toggle } = useSidebar();

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

  return (
    <>
      <AdminHeader
        title="대시보드"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">전체 회원</h3>
              <Users size={20} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              +12% 지난 달 대비
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">총 주문</h3>
              <Package size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalOrders.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              +8% 지난 달 대비
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">총 매출</h3>
              <Calendar size={20} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {(stats.totalRevenue / 100000000).toFixed(1)}억
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              +15% 지난 달 대비
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">월 매출</h3>
              <Award size={20} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {(stats.monthlyRevenue / 100000000).toFixed(1)}억
            </p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              +5% 지난 달 대비
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">판매 제품</h3>
              <Package size={20} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {stats.activeProducts}
            </p>
            <p className="text-sm text-gray-500 mt-2">현재 판매 중</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">재고 부족</h3>
              <Ban size={20} className="text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.lowStock}</p>
            <p className="text-sm text-red-500 mt-2">즉시 확인 필요</p>
          </div>
        </div>

        {/* 빠른 링크 */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 링크</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`${link.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
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
