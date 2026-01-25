"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import AdminHeader from "../_components/AdminHeader";
import { useSidebar } from "../_components/AdminLayoutClient";
import Pagination from "../_components/Pagination";
import { generateReservations, type Reservation } from "../_data/mockData";

export default function ReservationsPage() {
  const { toggle } = useSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 상태 읽기
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("limit")) || 20;
  const searchQuery = searchParams.get("q") || "";
  const brandFilter = searchParams.get("brand") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // 필터 드롭다운 상태
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const reservations = useMemo(() => generateReservations(), []);

  // 브랜드 및 상태 목록
  const brands = useMemo(
    () => [...new Set(reservations.map((r) => r.brand))],
    [reservations],
  );
  const statuses = ["예약진행중", "예약마감", "통관중", "배송중", "배송완료"];

  // 필터링
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        reservation.productName.toLowerCase().includes(searchLower) ||
        reservation.brand.toLowerCase().includes(searchLower) ||
        reservation.bottleId.toLowerCase().includes(searchLower);
      const matchesBrand =
        brandFilter === "all" || reservation.brand === brandFilter;
      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [reservations, searchQuery, brandFilter, statusFilter]);

  // 페이지네이션
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`/admin/reservations?${params.toString()}`);
  };

  const handleReservationClick = (reservationId: number) => {
    router.push(`/admin/reservations/${reservationId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "예약진행중":
        return "bg-blue-100 text-blue-700";
      case "예약마감":
        return "bg-gray-200 text-gray-700";
      case "통관중":
        return "bg-yellow-100 text-yellow-700";
      case "배송중":
        return "bg-orange-100 text-orange-700";
      case "배송완료":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "위스키내비":
        return "bg-amber-100 text-amber-700";
      case "더 위스키테일즈":
        return "bg-blue-100 text-blue-700";
      case "트레일 앤 테일":
        return "bg-green-100 text-green-700";
      case "투게더 인 스피릿":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <AdminHeader title="예약 관리" onToggleSidebar={toggle} />

      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    이미지
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    제품명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase relative">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className="flex items-center gap-1 hover:text-amber-600"
                    >
                      브랜드
                      <Filter size={12} />
                    </button>
                    {showBrandFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-40">
                        <button
                          onClick={() => {
                            updateFilter("brand", "all");
                            setShowBrandFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        {brands.map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              updateFilter("brand", brand);
                              setShowBrandFilter(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === brand ? "bg-amber-50 text-amber-700" : ""}`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    가격
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    예약 현황
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase relative">
                    <button
                      onClick={() => setShowStatusFilter(!showStatusFilter)}
                      className="flex items-center gap-1 hover:text-amber-600"
                    >
                      상태
                      <Filter size={12} />
                    </button>
                    {showStatusFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                        <button
                          onClick={() => {
                            updateFilter("status", "all");
                            setShowStatusFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${statusFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        {statuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              updateFilter("status", status);
                              setShowStatusFilter(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${statusFilter === status ? "bg-amber-50 text-amber-700" : ""}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    공고일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    마감일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {reservation.id}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={
                          reservation.imageUrl ||
                          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100"
                        }
                        alt={reservation.productName}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100";
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium max-w-[200px] truncate">
                      {reservation.productName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getBrandColor(reservation.brand)}`}
                      >
                        {reservation.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {reservation.price.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium">
                          {reservation.currentReservations}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">
                          {reservation.totalQuantity}
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              reservation.currentReservations >=
                              reservation.totalQuantity
                                ? "bg-red-500"
                                : reservation.currentReservations >=
                                    reservation.totalQuantity * 0.8
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min((reservation.currentReservations / reservation.totalQuantity) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(reservation.status)}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.noticeDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.deadline}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleReservationClick(reservation.id)}
                        className="text-amber-600 hover:text-amber-700 font-medium"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filteredReservations.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </>
  );
}
