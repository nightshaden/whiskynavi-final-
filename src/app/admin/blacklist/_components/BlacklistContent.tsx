"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, AlertTriangle } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { initialBlacklist, type BlacklistItem } from "../../_data/mockData";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BlacklistItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 새 블랙리스트 항목 상태
  const [newItem, setNewItem] = useState({
    name: "",
    reason: "",
    startDate: "",
    endDate: "",
    isPermanent: false,
  });

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

  const handleAdd = () => {
    if (!newItem.name || !newItem.reason) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    const newId = Math.max(...blacklist.map((b) => b.id), 0) + 1;
    setBlacklist([
      ...blacklist,
      {
        id: newId,
        name: newItem.name,
        reason: newItem.reason,
        startDate: newItem.startDate || "-",
        endDate: newItem.isPermanent ? "영구" : newItem.endDate || "-",
      },
    ]);
    setShowAddModal(false);
    setNewItem({
      name: "",
      reason: "",
      startDate: "",
      endDate: "",
      isPermanent: false,
    });
  };

  const handleEdit = (item: BlacklistItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setBlacklist(
      blacklist.map((item) =>
        item.id === editingItem.id ? editingItem : item,
      ),
    );
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingId !== null) {
      setBlacklist(blacklist.filter((item) => item.id !== deletingId));
    }
    setShowDeleteConfirm(false);
    setDeletingId(null);
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
            onClick={() => setShowAddModal(true)}
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
                          onClick={() => handleEdit(item)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

      {/* 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  블랙리스트 추가
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="이름 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사유 *
                </label>
                <textarea
                  value={newItem.reason}
                  onChange={(e) =>
                    setNewItem({ ...newItem, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="제재 사유 입력"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={newItem.startDate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={newItem.endDate}
                    onChange={(e) =>
                      setNewItem({ ...newItem, endDate: e.target.value })
                    }
                    disabled={newItem.isPermanent}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permanent"
                  checked={newItem.isPermanent}
                  onChange={(e) =>
                    setNewItem({ ...newItem, isPermanent: e.target.checked })
                  }
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label
                  htmlFor="permanent"
                  className="text-sm font-medium text-gray-700"
                >
                  영구 제재
                </label>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                추가
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  블랙리스트 수정
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사유
                </label>
                <textarea
                  value={editingItem.reason}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일
                  </label>
                  <input
                    type="text"
                    value={editingItem.startDate}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일
                  </label>
                  <input
                    type="text"
                    value={editingItem.endDate}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">삭제 확인</h3>
              </div>
              <p className="text-gray-600">
                이 항목을 블랙리스트에서 삭제하시겠습니까?
              </p>
            </div>

            <div className="p-6 bg-gray-50 flex gap-2">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
