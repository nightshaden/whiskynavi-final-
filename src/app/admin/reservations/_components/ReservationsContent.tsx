"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { generateReservations } from "../../_data/mockData";

interface ReservationsContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
  };
}

export default function ReservationsContent({
  searchParams,
}: ReservationsContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  // searchParams에서 상태 읽기
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";
  const brandFilter = searchParams.brand || "all";

  // 필터 드롭다운 상태
  const [showBrandFilter, setShowBrandFilter] = useState(false);

  const reservations = useMemo(() => generateReservations(), []);

  // 브랜드 목록 추출
  const brands = useMemo(
    () => [...new Set(reservations.map((r) => r.brand))],
    [reservations],
  );

  // 필터링 및 정렬
  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        reservation.productName.toLowerCase().includes(searchLower) ||
        reservation.username.toLowerCase().includes(searchLower) ||
        reservation.brand.toLowerCase().includes(searchLower);
      const matchesBrand =
        brandFilter === "all" || reservation.brand === brandFilter;

      return matchesSearch && matchesBrand;
    });
  }, [reservations, searchQuery, brandFilter]);

  // 페이지네이션
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(start, start + itemsPerPage);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
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

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin/reservations?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="예약 관리"
        onToggleSidebar={toggle}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

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
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-40 max-h-60 overflow-y-auto">
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
                    예약자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    수량
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    예약일
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
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium max-w-[200px] truncate">
                      {reservation.productName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.brand}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reservation.reservationDate}
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
            searchParams={searchParams}
            basePath="/admin/reservations"
          />
        </div>
      </div>
    </>
  );
}
