"use client";
import React from "react";
import {
  Package,
  Settings,
  Upload,
  Trash2,
  Edit2,
  Save,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useState, useMemo } from "react";

interface DetailSectionProps {
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  reservationDetails: any;
  setReservationDetails: (details: any) => void;
  formatDateForInput: (dateStr: string) => string;
}

export default function AdminPageDetailSection({
  isEditMode,
  setIsEditMode,
  reservationDetails,
  setReservationDetails,
  formatDateForInput,
}: DetailSectionProps) {
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    | "name"
    | "requested"
    | "approved"
    | "membershipNavi"
    | "membershipTales"
    | "appliedAt"
  >("appliedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pickupLocationFilter, setPickupLocationFilter] =
    useState<string>("all");
  const [membershipNaviFilter, setMembershipNaviFilter] =
    useState<string>("all");
  const [membershipTalesFilter, setMembershipTalesFilter] =
    useState<string>("all");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("all");

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 필 드롭다운 표시 상태
  const [showPickupFilter, setShowPickupFilter] = useState(false);
  const [showNaviFilter, setShowNaviFilter] = useState(false);
  const [showTalesFilter, setShowTalesFilter] = useState(false);
  const [showMemberTypeFilter, setShowMemberTypeFilter] = useState(false);

  // 현재 승인 총합 계산
  const totalApproved = useMemo(() => {
    return (
      reservationDetails.applicants?.reduce(
        (sum: number, app: any) => sum + app.approvedBottles,
        0,
      ) || 0
    );
  }, [reservationDetails.applicants]);

  // 픽업 장소 목록 추출
  const pickupLocations = useMemo(() => {
    const locations = new Set(
      reservationDetails.applicants
        ?.map((a: any) => a.pickupLocation)
        .filter((loc: any): loc is string => typeof loc === "string") || [],
    );
    return Array.from(locations) as string[];
  }, [reservationDetails.applicants]);

  // 검색 및 필터링
  const filteredApplicants =
    reservationDetails.applicants?.filter((applicant: any) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        applicant.name.toLowerCase().includes(searchLower) ||
        applicant.phone.includes(searchLower);

      const matchesPickup =
        pickupLocationFilter === "all" ||
        applicant.pickupLocation === pickupLocationFilter;
      const matchesMembershipNavi =
        membershipNaviFilter === "all" ||
        (membershipNaviFilter === "none" && !applicant.whiskeyNaviMembership) ||
        applicant.whiskeyNaviMembership === membershipNaviFilter;
      const matchesMembershipTales =
        membershipTalesFilter === "all" ||
        (membershipTalesFilter === "none" &&
          !applicant.whiskeyTalesMembership) ||
        applicant.whiskeyTalesMembership === membershipTalesFilter;
      const matchesMemberType =
        memberTypeFilter === "all" || applicant.memberType === memberTypeFilter;

      return (
        matchesSearch &&
        matchesPickup &&
        matchesMembershipNavi &&
        matchesMembershipTales &&
        matchesMemberType
      );
    }) || [];

  // 정렬
  const sortedApplicants = [...filteredApplicants].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "requested":
        compareValue = a.requestedBottles - b.requestedBottles;
        break;
      case "approved":
        compareValue = a.approvedBottles - b.approvedBottles;
        break;
      case "membershipNavi":
        const naviOrder: any = { VIP: 3, GOLD: 2, SILVER: 1, null: 0 };
        compareValue =
          (naviOrder[a.whiskeyNaviMembership] || 0) -
          (naviOrder[b.whiskeyNaviMembership] || 0);
        break;
      case "membershipTales":
        const talesOrder: any = { VIP: 3, GOLD: 2, SILVER: 1, null: 0 };
        compareValue =
          (talesOrder[a.whiskeyTalesMembership] || 0) -
          (talesOrder[b.whiskeyTalesMembership] || 0);
        break;
      case "appliedAt":
        compareValue =
          new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  // 페이지네이션 관련 함수
  const totalPages = Math.ceil(sortedApplicants.length / itemsPerPage);
  const currentApplicants = sortedApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 날짜 포맷 함수 (2026-01-20T16:50 → 2026-01-20 PM 4:50)
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} ${ampm} ${hours}:${minutes}`;
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setSearchQuery("");
    setPickupLocationFilter("all");
    setMembershipNaviFilter("all");
    setMembershipTalesFilter("all");
    setMemberTypeFilter("all");
    setCurrentPage(1);
  };

  // 필터가 적용되어 있는지 확인
  const hasActiveFilters =
    searchQuery !== "" ||
    pickupLocationFilter !== "all" ||
    membershipNaviFilter !== "all" ||
    membershipTalesFilter !== "all" ||
    memberTypeFilter !== "all";

  return (
    <>
      {/* 예약 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex gap-4">
          {/* 이미지 */}
          <div
            className="flex-shrink-0 relative"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            {reservationDetails.imageUrl ? (
              <>
                <img
                  src={reservationDetails.imageUrl}
                  alt={reservationDetails.productName}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {isEditMode && isImageHovered && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center gap-1">
                    <label className="cursor-pointer px-2 py-1 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors text-xs flex items-center gap-1">
                      <Upload size={12} />
                      변경
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReservationDetails({
                                ...reservationDetails,
                                imageUrl: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() =>
                        setReservationDetails({
                          ...reservationDetails,
                          imageUrl: "",
                        })
                      }
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      삭제
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                {isEditMode && (
                  <label className="cursor-pointer text-gray-500 hover:text-gray-700 flex flex-col items-center gap-1">
                    <Upload size={16} />
                    <span className="text-xs">이미지 업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setReservationDetails({
                              ...reservationDetails,
                              imageUrl: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {reservationDetails.productName}
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  {reservationDetails.brand}
                </p>
              </div>

              {/* 편집 버튼 */}
              {isEditMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      // 실제로는 여기서 저장 API 호출
                    }}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs flex items-center gap-1"
                  >
                    <Save size={14} />
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs flex items-center gap-1"
                  >
                    <X size={14} />
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs flex items-center gap-1"
                >
                  <Edit2 size={14} />
                  편집
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  가격
                </label>
                {isEditMode ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={reservationDetails.price}
                      onChange={(e) =>
                        setReservationDetails({
                          ...reservationDetails,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-bold text-amber-600"
                    />
                    <span className="text-xs text-gray-600">원</span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-amber-600">
                    {reservationDetails.price.toLocaleString()}원
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  총 수량
                </label>
                {isEditMode ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={reservationDetails.totalQuantity}
                      onChange={(e) =>
                        setReservationDetails({
                          ...reservationDetails,
                          totalQuantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-bold text-gray-900"
                    />
                    <span className="text-xs text-gray-600">병</span>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-900">
                    {reservationDetails.totalQuantity}병
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  예약 상태
                </label>
                {isEditMode ? (
                  <select
                    value={reservationDetails.status}
                    onChange={(e) =>
                      setReservationDetails({
                        ...reservationDetails,
                        status: e.target.value,
                      })
                    }
                    className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-bold text-gray-900"
                  >
                    <option value="예약진행중">예약진행중</option>
                    <option value="예약마감">예약마감</option>
                    <option value="통관중">통관중</option>
                    <option value="배송중">배송중</option>
                    <option value="배송완료">배송완료</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-gray-900">
                    {reservationDetails.status}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  예약 시작 일시
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formatDateForInput(reservationDetails.noticeDate)}
                      onChange={(e) =>
                        setReservationDetails({
                          ...reservationDetails,
                          noticeDate: e.target.value,
                        })
                      }
                      className="pl-8 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-gray-900"
                    />
                    <CalendarDays
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-900">
                    {formatDateTime(reservationDetails.noticeDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-0.5 block">
                  예약 마감 일시
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formatDateForInput(reservationDetails.deadline)}
                      onChange={(e) =>
                        setReservationDetails({
                          ...reservationDetails,
                          deadline: e.target.value,
                        })
                      }
                      className="pl-8 pr-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-gray-900"
                    />
                    <CalendarDays
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={14}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-gray-900">
                    {formatDateTime(reservationDetails.deadline)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 승인 현황 - 컴팩트 버전 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900">승인 현황</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              총 {reservationDetails.applicants?.length || 0}명 신청
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${
                totalApproved >= reservationDetails.totalQuantity
                  ? "text-red-600"
                  : totalApproved > reservationDetails.totalQuantity * 0.8
                    ? "text-amber-600"
                    : "text-green-600"
              }`}
            >
              {totalApproved}{" "}
              <span className="text-sm text-gray-500">
                / {reservationDetails.totalQuantity}병
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {(
                (totalApproved / reservationDetails.totalQuantity) *
                100
              ).toFixed(1)}
              % 승인됨
            </p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              totalApproved >= reservationDetails.totalQuantity
                ? "bg-red-500"
                : totalApproved > reservationDetails.totalQuantity * 0.8
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            style={{
              width: `${Math.min((totalApproved / reservationDetails.totalQuantity) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 신청자 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">신청자 목록</h3>
            <input
              type="text"
              placeholder="이름, 전화번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 w-64"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {filteredApplicants.length}명
            </p>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                {/* 활성화된 필터 표시 */}
                <div className="flex items-center gap-1 flex-wrap">
                  {searchQuery && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                      검색: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-amber-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {memberTypeFilter !== "all" && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                      회원유형: {memberTypeFilter}
                      <button
                        onClick={() => setMemberTypeFilter("all")}
                        className="hover:text-amber-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {membershipNaviFilter !== "all" && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                      위스키내비:{" "}
                      {membershipNaviFilter === "none"
                        ? "미가입"
                        : membershipNaviFilter}
                      <button
                        onClick={() => setMembershipNaviFilter("all")}
                        className="hover:text-amber-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {membershipTalesFilter !== "all" && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                      위스키테일즈:{" "}
                      {membershipTalesFilter === "none"
                        ? "미가입"
                        : membershipTalesFilter}
                      <button
                        onClick={() => setMembershipTalesFilter("all")}
                        className="hover:text-amber-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {pickupLocationFilter !== "all" && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs flex items-center gap-1">
                      픽업장소: {pickupLocationFilter}
                      <button
                        onClick={() => setPickupLocationFilter("all")}
                        className="hover:text-amber-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={resetFilters}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs flex items-center gap-1 whitespace-nowrap"
                >
                  <X size={12} />
                  전체 초기화
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-20 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  ID
                </th>
                <th className="w-24 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  이름
                </th>
                <th className="w-28 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  전화번호
                </th>
                <th className="w-20 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                  <button
                    onClick={() =>
                      setShowMemberTypeFilter(!showMemberTypeFilter)
                    }
                    className="flex items-center gap-1 hover:text-amber-600"
                  >
                    회원유형
                    <Filter size={12} />
                  </button>
                  {showMemberTypeFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                      <button
                        onClick={() => {
                          setMemberTypeFilter("all");
                          setShowMemberTypeFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${memberTypeFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        전체
                      </button>
                      <button
                        onClick={() => {
                          setMemberTypeFilter("일반");
                          setShowMemberTypeFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${memberTypeFilter === "일반" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        일반
                      </button>
                      <button
                        onClick={() => {
                          setMemberTypeFilter("업장");
                          setShowMemberTypeFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${memberTypeFilter === "업장" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        업장
                      </button>
                    </div>
                  )}
                </th>
                <th className="w-28 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                  <button
                    onClick={() => setShowNaviFilter(!showNaviFilter)}
                    className="flex items-center gap-1 hover:text-amber-600"
                  >
                    위스키내비
                    <Filter size={12} />
                  </button>
                  {showNaviFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                      <button
                        onClick={() => {
                          setMembershipNaviFilter("all");
                          setShowNaviFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipNaviFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        전체
                      </button>
                      <button
                        onClick={() => {
                          setMembershipNaviFilter("VIP");
                          setShowNaviFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipNaviFilter === "VIP" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        VIP
                      </button>
                      <button
                        onClick={() => {
                          setMembershipNaviFilter("GOLD");
                          setShowNaviFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipNaviFilter === "GOLD" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        GOLD
                      </button>
                      <button
                        onClick={() => {
                          setMembershipNaviFilter("SILVER");
                          setShowNaviFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipNaviFilter === "SILVER" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        SILVER
                      </button>
                      <button
                        onClick={() => {
                          setMembershipNaviFilter("none");
                          setShowNaviFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipNaviFilter === "none" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        미가입
                      </button>
                    </div>
                  )}
                </th>
                <th className="w-28 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                  <button
                    onClick={() => setShowTalesFilter(!showTalesFilter)}
                    className="flex items-center gap-1 hover:text-amber-600"
                  >
                    위스키테일즈
                    <Filter size={12} />
                  </button>
                  {showTalesFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                      <button
                        onClick={() => {
                          setMembershipTalesFilter("all");
                          setShowTalesFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipTalesFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        전체
                      </button>
                      <button
                        onClick={() => {
                          setMembershipTalesFilter("VIP");
                          setShowTalesFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipTalesFilter === "VIP" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        VIP
                      </button>
                      <button
                        onClick={() => {
                          setMembershipTalesFilter("GOLD");
                          setShowTalesFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipTalesFilter === "GOLD" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        GOLD
                      </button>
                      <button
                        onClick={() => {
                          setMembershipTalesFilter("SILVER");
                          setShowTalesFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipTalesFilter === "SILVER" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        SILVER
                      </button>
                      <button
                        onClick={() => {
                          setMembershipTalesFilter("none");
                          setShowTalesFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${membershipTalesFilter === "none" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        미가입
                      </button>
                    </div>
                  )}
                </th>
                <th className="w-20 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  신청
                </th>
                <th className="w-20 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  승인
                </th>
                <th className="w-24 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                  <button
                    onClick={() => setShowPickupFilter(!showPickupFilter)}
                    className="flex items-center gap-1 hover:text-amber-600"
                  >
                    픽업장소
                    <Filter size={12} />
                  </button>
                  {showPickupFilter && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                      <button
                        onClick={() => {
                          setPickupLocationFilter("all");
                          setShowPickupFilter(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${pickupLocationFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                      >
                        전체
                      </button>
                      {pickupLocations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            setPickupLocationFilter(location);
                            setShowPickupFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${pickupLocationFilter === location ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="w-32 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  신청일시
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentApplicants.length > 0 ? (
                currentApplicants.map((applicant: any, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 text-xs text-gray-900">
                      {applicant.id}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                      {applicant.name}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {applicant.phone}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          applicant.memberType === "업장"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {applicant.memberType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {applicant.whiskeyNaviMembership ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            applicant.whiskeyNaviMembership === "VIP"
                              ? "bg-amber-100 text-amber-700"
                              : applicant.whiskeyNaviMembership === "GOLD"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {applicant.whiskeyNaviMembership}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {applicant.whiskeyTalesMembership ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            applicant.whiskeyTalesMembership === "VIP"
                              ? "bg-amber-100 text-amber-700"
                              : applicant.whiskeyTalesMembership === "GOLD"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {applicant.whiskeyTalesMembership}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                      {applicant.requestedBottles}병
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <input
                        type="number"
                        min="0"
                        max={applicant.requestedBottles}
                        value={applicant.approvedBottles ?? 0}
                        onChange={(e) => {
                          const originalIndex =
                            reservationDetails.applicants.findIndex(
                              (a: any) => a.id === applicant.id,
                            );
                          const newApplicants = [
                            ...reservationDetails.applicants,
                          ];
                          newApplicants[originalIndex].approvedBottles =
                            parseInt(e.target.value) || 0;
                          setReservationDetails({
                            ...reservationDetails,
                            applicants: newApplicants,
                          });
                        }}
                        className="w-14 px-1.5 py-0.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-medium text-amber-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {applicant.pickupLocation}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {formatDateTime(applicant.appliedAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    신청자가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">페이지당:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 ml-4">
              {sortedApplicants.length}개 중{" "}
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, sortedApplicants.length)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded text-sm font-medium ${
                    currentPage === pageNum
                      ? "bg-amber-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
