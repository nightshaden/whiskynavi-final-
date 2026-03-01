import { getStats } from "../_lib/getStats";

const fmt = (v: number | null) => (v !== null ? v.toLocaleString() : "-");

export default async function SidebarStatsSection() {
  const stats = await getStats();

  return (
    <div className="p-6 mt-6 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">빠른 통계</h3>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">전체 회원</p>
          <p className="text-lg font-bold text-gray-900">
            {fmt(stats.totalUsers)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">총 주문</p>
          <p className="text-lg font-bold text-gray-900">
            {fmt(stats.totalOrders)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">등록 제품</p>
          <p className="text-lg font-bold text-green-600">
            {fmt(stats.totalBottles)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">예약 공고</p>
          <p className="text-lg font-bold text-amber-600">
            {fmt(stats.totalNotices)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">예약 신청</p>
          <p className="text-lg font-bold text-purple-600">
            {fmt(stats.totalApplications)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">사업자 회원</p>
          <p className="text-lg font-bold text-blue-600">
            {fmt(stats.totalBusinessMembers)}
          </p>
        </div>
      </div>
    </div>
  );
}
