"use client";

import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { generateUsers, type User } from "../../_data/mockData";

// 헬퍼 함수: roles에서 memberType 계산
const getMemberType = (user: User): "일반" | "업장" => {
  return user.roles.includes("ROLE_BUSINESS") ? "업장" : "일반";
};

// 헬퍼 함수: createdAt을 가입일 형식으로 변환
const formatJoinDate = (createdAt: string): string => {
  const date = new Date(createdAt);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

interface UsersContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    memberType?: string;
    navi?: string;
    tales?: string;
    sortBy?: string;
    order?: string;
  };
}

export default function UsersContent({ searchParams }: UsersContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  // searchParams에서 상태 읽기
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";
  const memberTypeFilter = searchParams.memberType || "all";
  const naviFilter = searchParams.navi || "all";
  const talesFilter = searchParams.tales || "all";
  const sortBy = (searchParams.sortBy as "name" | "joinDate") || "joinDate";
  const sortOrder = (searchParams.order as "asc" | "desc") || "desc";

  // 필터 드롭다운 상태
  const [showMemberTypeFilter, setShowMemberTypeFilter] = useState(false);
  const [showNaviFilter, setShowNaviFilter] = useState(false);
  const [showTalesFilter, setShowTalesFilter] = useState(false);

  const users = useMemo(() => generateUsers(), []);

  // 필터링 및 정렬
  const filteredUsers = useMemo(() => {
    const result = users.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower);
      const matchesMemberType =
        memberTypeFilter === "all" || getMemberType(user) === memberTypeFilter;
      const matchesNavi =
        naviFilter === "all" ||
        (naviFilter === "member" && !!user.whiskeyNaviMembership) ||
        (naviFilter === "none" && !user.whiskeyNaviMembership);
      const matchesTales =
        talesFilter === "all" ||
        (talesFilter === "none" && !user.whiskeyTalesMembership) ||
        user.whiskeyTalesMembership === talesFilter;

      return matchesSearch && matchesMemberType && matchesNavi && matchesTales;
    });

    result.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case "name":
          compareValue = a.name.localeCompare(b.name);
          break;
        case "joinDate":
          compareValue =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [
    users,
    searchQuery,
    memberTypeFilter,
    naviFilter,
    talesFilter,
    sortBy,
    sortOrder,
  ]);

  // 페이지네이션
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    // 기존 params 복사
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleUserClick = (userId: number) => {
    router.push(`/admin/users/${userId}`);
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
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="회원 관리"
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
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    사용자명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    이메일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowMemberTypeFilter(!showMemberTypeFilter)
                      }
                      className="flex items-center gap-1 hover:text-amber-600 cursor-pointer"
                    >
                      회원 유형
                      <Filter size={12} />
                    </button>
                    {showMemberTypeFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                        {["all", "일반", "업장"].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => {
                              updateFilter("memberType", type);
                              setShowMemberTypeFilter(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 cursor-pointer ${
                              memberTypeFilter === type
                                ? "bg-amber-50 text-amber-700"
                                : ""
                            }`}
                          >
                            {type === "all" ? "전체" : type}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th className="w-20 px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                    <button
                      type="button"
                      onClick={() => setShowNaviFilter(!showNaviFilter)}
                      className="flex items-center gap-1 hover:text-amber-600 cursor-pointer"
                    >
                      내비
                      <Filter size={12} />
                    </button>
                    {showNaviFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("navi", "all");
                            setShowNaviFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 cursor-pointer ${naviFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("navi", "member");
                            setShowNaviFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 cursor-pointer ${naviFilter === "member" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          가입됨
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("navi", "none");
                            setShowNaviFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${naviFilter === "none" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          미가입
                        </button>
                      </div>
                    )}
                  </th>
                  <th className="w-20 px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative">
                    <button
                      type="button"
                      onClick={() => setShowTalesFilter(!showTalesFilter)}
                      className="flex items-center gap-1 hover:text-amber-600  cursor-pointer"
                    >
                      테일즈
                      <Filter size={12} />
                    </button>
                    {showTalesFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-32">
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "all");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 cursor-pointer ${talesFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "LV.1");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${talesFilter === "LV.1" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          LV.1
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "LV.2");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100  cursor-pointer${talesFilter === "LV.2" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          LV.2
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "LV.3");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${talesFilter === "LV.3" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          LV.3
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "LV.4");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${talesFilter === "LV.4" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          LV.4
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "LV.5");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${talesFilter === "LV.5" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          LV.5
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateFilter("tales", "none");
                            setShowTalesFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs cursor-pointer hover:bg-gray-100 ${talesFilter === "none" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          미가입
                        </button>
                      </div>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    가입일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      @{user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        className={
                          getMemberType(user) === "업장"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {getMemberType(user)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.whiskeyNaviMembership ? (
                        <Badge className="bg-amber-100 text-amber-700">
                          가입됨
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {user.whiskeyTalesMembership ? (
                        <Badge className="bg-blue-100 text-blue-700">
                          {user.whiskeyTalesMembership}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        className={
                          user.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {user.status === "ACTIVE" ? "활성" : "비활성"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatJoinDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() => handleUserClick(user.id)}
                        className="text-amber-600 hover:text-amber-700 cursor-pointer font-medium cursor-pointer"
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
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchParams={searchParams}
            basePath="/admin/users"
          />
        </div>
      </div>
    </>
  );
}
