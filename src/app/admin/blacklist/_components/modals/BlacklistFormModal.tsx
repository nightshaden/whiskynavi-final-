"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { AdminUserResponse, BlacklistRequest } from "@/apis/apis";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchInput } from "@/components/ui/search-input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { searchUsersAction } from "../../actions";

type BlacklistFormData = BlacklistRequest & {
  userId: number;
  name: string;
};

type BlacklistFormModalProps = {
  isOpen: boolean;
  close: () => void;
  mode: "add" | "edit";
  initialData?: BlacklistFormData;
  onSubmit: (data: BlacklistFormData) => void | Promise<void>;
};

function parseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateString(date: Date | undefined, isEndDate = false): string {
  if (!date) return "";
  // LocalDateTime 형식으로 변환 (시작일은 00:00:00, 종료일은 23:59:59)
  const time = isEndDate ? "T23:59:59" : "T00:00:00";
  return format(date, "yyyy-MM-dd") + time;
}

export default function BlacklistFormModal({
  isOpen,
  close,
  mode,
  initialData,
  onSubmit,
}: BlacklistFormModalProps) {
  const [formData, setFormData] = useState({
    userId: initialData?.userId?.toString() ?? "",
    name: initialData?.name ?? "",
    reason: initialData?.reason ?? "",
    startAt: parseDate(initialData?.startAt),
    endAt: initialData?.endAt ? parseDate(initialData.endAt) : null,
    isPermanent: !initialData?.endAt,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 검색 관련 state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(
    null,
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAdd = mode === "add";

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 검색 디바운싱
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchUsersAction(searchQuery);
        if (result.success && result.data) {
          setSearchResults(result.data);
          setShowDropdown(true);
        } else {
          console.error("사용자 검색 실패:", result.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("사용자 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // 사용자 선택 핸들러
  const handleSelectUser = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setFormData({ ...formData, userId: user.id.toString(), name: user.name });
    setSearchQuery("");
    setShowDropdown(false);
  };

  // 선택된 사용자 해제
  const handleClearSelection = () => {
    setSelectedUser(null);
    setFormData({ ...formData, userId: "", name: "" });
  };

  const handleSubmit = async () => {
    if (isAdd && !formData.userId) {
      alert("사용자를 선택해주세요.");
      return;
    }
    if (!formData.reason) {
      alert("사유를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        userId: Number(formData.userId),
        name: formData.name,
        reason: formData.reason,
        startAt: formatDateString(formData.startAt),
        endAt: formData.isPermanent
          ? null
          : formatDateString(formData.endAt ?? undefined, true),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            블랙리스트 {isAdd ? "추가" : "수정"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isAdd && (
            <div className="space-y-1.5">
              <Label>사용자 선택 *</Label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
                  <div>
                    <span className="font-medium">{selectedUser.name}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({selectedUser.email})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div ref={searchContainerRef} className="relative">
                  <SearchInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    placeholder="이름으로 사용자 검색..."
                    className="w-full"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-100"
                        >
                          <div>
                            <span className="font-medium">{user.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {user.email}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            ID: {user.id}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown &&
                    !isSearching &&
                    searchQuery &&
                    searchResults.length === 0 && (
                      <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                        검색 결과가 없습니다
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {!isAdd && (
            <div className="space-y-1.5">
              <Label>이름</Label>
              <div className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
                {formData.name}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reason">사유 *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={3}
              placeholder="제재 사유 입력"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-red-500",
                      !formData.startAt && "text-gray-400",
                    )}
                  >
                    {formData.startAt
                      ? format(formData.startAt, "yyyy년 MM월 dd일", {
                          locale: ko,
                        })
                      : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startAt}
                    onSelect={(date) =>
                      setFormData({ ...formData, startAt: date })
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label>종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={formData.isPermanent}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100",
                      !formData.endAt &&
                        !formData.isPermanent &&
                        "text-gray-400",
                    )}
                  >
                    {formData.isPermanent
                      ? "영구 제재"
                      : formData.endAt
                        ? format(formData.endAt, "yyyy년 MM월 dd일", {
                            locale: ko,
                          })
                        : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endAt ?? undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, endAt: date ?? null })
                    }
                    locale={ko}
                    disabled={(date) =>
                      formData.startAt ? date < formData.startAt : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="permanent"
              checked={formData.isPermanent}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isPermanent: checked === true,
                  endAt: checked === true ? undefined : formData.endAt,
                })
              }
            />
            <Label htmlFor="permanent">영구 제재</Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1" onClick={close}>
            취소
          </Button>
          <Button
            variant={isAdd ? "destructive" : "default"}
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : isAdd ? "추가" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
