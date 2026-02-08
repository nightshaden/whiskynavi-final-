"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";

import type { AdminUserResponse, UserRole } from "@/apis/apis";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { ROLE_COLOR_MAP, ROLE_LABEL_MAP } from "../../constants";
import { removeMembershipAction } from "../actions";
import AddMemberModal from "./AddMemberModal";
import RemoveMemberConfirmModal from "./RemoveMemberConfirmModal";

type MembershipBrand = "navi" | "tales";

const MEMBERSHIP_ROLES: UserRole[] = [
  "ROLE_WHISKYNAVI_MEMBER",
  "ROLE_WHISKYTALES_MEMBER",
];

const BUSINESS_ROLES: UserRole[] = [
  "ROLE_BUSINESS",
  "ROLE_TRAILNTALE_BUSINESS",
  "ROLE_COMMUNITY_BUSINESS",
  "ROLE_PICK_UP_BUSINESS",
];

const getMemberType = (roles: UserRole[]): string => {
  const hasBusiness = BUSINESS_ROLES.some((r) => roles.includes(r));
  return hasBusiness ? "업장" : "일반";
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

interface MembershipContentProps {
  searchParams: {
    brand?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortDirection?: string;
  };
  brand: MembershipBrand;
  users: AdminUserResponse[];
  totalElements: number;
}

export default function MembershipContent({
  searchParams,
  brand,
  users,
  totalElements,
}: MembershipContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const sortBy = searchParams.sortBy || "createdAt";
  const sortDirection = searchParams.sortDirection || "desc";

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    Object.entries(updates).forEach(([k, v]) => {
      params.set(k, v);
    });
    router.push(`/admin/membership?${params.toString()}`);
  };

  const handleBrandChange = (newBrand: MembershipBrand) => {
    updateParams({ brand: newBrand, page: "1" });
  };

  const handleSortChange = (newSortBy: string) => {
    updateParams({ sortBy: newSortBy, page: "1" });
  };

  const handleSortDirectionToggle = () => {
    updateParams({
      sortDirection: sortDirection === "asc" ? "desc" : "asc",
    });
  };

  const handleAddMember = () => {
    overlay.open(({ isOpen, close }) => (
      <AddMemberModal isOpen={isOpen} close={close} brand={brand} />
    ));
  };

  const handleRemoveMember = (user: AdminUserResponse) => {
    overlay.open(({ isOpen, close }) => (
      <RemoveMemberConfirmModal
        isOpen={isOpen}
        close={close}
        userName={user.name}
        username={user.username}
        onConfirm={async () => {
          const result = await removeMembershipAction(user.id, brand);
          if (!result.success) {
            alert(result.error);
          }
          router.refresh();
        }}
      />
    ));
  };

  return (
    <>
      <AdminHeader
        title="멤버십 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        {/* 브랜드 선택 탭 및 액션 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleBrandChange("navi")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                brand === "navi"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              위스키내비
            </button>
            <button
              type="button"
              onClick={() => handleBrandChange("tales")}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                brand === "tales"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              더 위스키테일즈
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin/membership/benefits")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold cursor-pointer"
            >
              혜택 관리
            </button>
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              멤버십 추가
            </button>
          </div>
        </div>

        {/* 정렬 및 요약 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">정렬:</label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">가입일</SelectItem>
                <SelectItem value="name">이름</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleSortDirectionToggle}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {sortDirection === "asc" ? "↑ 오름차순" : "↓ 내림차순"}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>총 {totalElements}명의 멤버</span>
          </div>
        </div>

        {/* 멤버십 회원 목록 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-16 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  ID
                </th>
                <th className="w-40 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  이름
                </th>
                <th className="w-44 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  닉네임
                </th>
                <th className="w-44 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  전화번호
                </th>
                <th className="w-28 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  회원유형
                </th>
                <th className="w-32 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  멤버십
                </th>
                <th className="w-28 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  가입일
                </th>
                <th className="w-20 px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    멤버십 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const memberType = getMemberType(user.roles);
                  const membershipRoles = MEMBERSHIP_ROLES.filter((r) =>
                    user.roles.includes(r),
                  );

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                        {user.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        @{user.username}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {user.phone || "-"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            memberType === "업장"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {memberType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {membershipRoles.map((role) => (
                            <Badge
                              key={role}
                              className={ROLE_COLOR_MAP[role]}
                            >
                              {ROLE_LABEL_MAP[role]}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(user)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="멤버십 해제"
                        >
                          <UserMinus size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <Pagination
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchParams={searchParams}
            basePath="/admin/membership"
          />
        </div>
      </div>
    </>
  );
}
