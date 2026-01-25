"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2 } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { initialBlacklist, type BlacklistItem } from "../../_data/mockData";
import { overlay } from "overlay-kit";
import BlacklistFormModal from "./modals/BlacklistFormModal";
import DeleteConfirmModal from "./modals/BlacklistDeleteModal";

interface BlacklistContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
  };
}

export default function BlacklistContent({
  searchParams,
}: BlacklistContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  // searchParams에서 상태 읽기
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";

  const [blacklist, setBlacklist] = useState<BlacklistItem[]>(initialBlacklist);

  // 필터링
  const filteredBlacklist = useMemo(() => {
    return blacklist.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.reason.toLowerCase().includes(searchLower)
      );
    });
  }, [blacklist, searchQuery]);

  // 페이지네이션
  const paginatedBlacklist = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBlacklist.slice(start, start + itemsPerPage);
  }, [filteredBlacklist, currentPage, itemsPerPage]);

  const openAddModal = () => {
    overlay.open(({ isOpen, close }) => (
      <BlacklistFormModal
        isOpen={isOpen}
        close={close}
        mode="add"
        onSubmit={(newItemData) => {
          const newId = Math.max(...blacklist.map((b) => b.id), 0) + 1;
          setBlacklist([...blacklist, { id: newId, ...newItemData }]);
        }}
      />
    ));
  };

  const openEditModal = (item: BlacklistItem) => {
    overlay.open(({ isOpen, close }) => (
      <BlacklistFormModal
        isOpen={isOpen}
        close={close}
        mode="edit"
        initialData={item}
        onSubmit={(editedData) => {
          setBlacklist(
            blacklist.map((i) =>
              i.id === item.id ? { id: item.id, ...editedData } : i,
            ),
          );
        }}
      />
    ));
  };

  const openDeleteModal = (id: number) => {
    overlay.open(({ isOpen, close }) => (
      <DeleteConfirmModal
        isOpen={isOpen}
        close={close}
        onConfirm={() => {
          setBlacklist(blacklist.filter((item) => item.id !== id));
        }}
      />
    ));
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
    router.push(`/admin/blacklist?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="블랙리스트"
        onToggleSidebar={toggle}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <div className="p-8">
        {/* 추가 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            블랙리스트 추가
          </button>
        </div>

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
                    사유
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    제재 시작일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    제재 종료일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedBlacklist.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[300px] truncate">
                      {item.reason}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.startDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span
                        className={
                          item.endDate === "영구"
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {item.endDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={filteredBlacklist.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchParams={searchParams}
            basePath="/admin/blacklist"
          />
        </div>
      </div>
    </>
  );
}
