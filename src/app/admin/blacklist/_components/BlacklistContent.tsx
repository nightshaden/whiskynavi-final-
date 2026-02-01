"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { type BlacklistItem, initialBlacklist } from "../../_data/mockData";
import DeleteConfirmModal from "./modals/BlacklistDeleteModal";
import BlacklistFormModal from "./modals/BlacklistFormModal";

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
  console.log("initialBlacklist", initialBlacklist);
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
          <Button variant="destructive" onClick={openAddModal}>
            <Plus size={16} />
            블랙리스트 추가
          </Button>
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
                      {item.startAt}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span
                        className={
                          item.endAt === "영구"
                            ? "text-red-600 font-semibold"
                            : ""
                        }
                      >
                        {item.endAt}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="edit"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="delete"
                          onClick={() => openDeleteModal(item.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
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
