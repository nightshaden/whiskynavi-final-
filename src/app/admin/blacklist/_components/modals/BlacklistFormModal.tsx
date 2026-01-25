"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { type BlacklistItem } from "../../../_data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// 날짜 문자열을 Date 객체로 변환
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr || dateStr === "-" || dateStr === "영구") return undefined;
  // YYYY-MM-DD 또는 YYYY.MM.DD 형식 처리
  const normalized = dateStr.replace(/\./g, "-");
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? undefined : date;
}

// Date 객체를 YYYY-MM-DD 형식으로 변환
function formatDateString(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

// 추가/수정 통합 모달 컴포넌트
export default function BlacklistFormModal({
  isOpen,
  close,
  mode,
  initialData,
  onSubmit,
}: {
  isOpen: boolean;
  close: () => void;
  mode: "add" | "edit";
  initialData?: BlacklistItem;
  onSubmit: (item: Omit<BlacklistItem, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    reason: initialData?.reason ?? "",
    startDate: parseDate(initialData?.startDate ?? ""),
    endDate: parseDate(initialData?.endDate ?? ""),
    isPermanent: initialData?.endDate === "영구",
  });

  const isAdd = mode === "add";

  const handleSubmit = () => {
    if (!formData.name || !formData.reason) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    onSubmit({
      name: formData.name,
      reason: formData.reason,
      startDate: formData.startDate ? formatDateString(formData.startDate) : "-",
      endDate: formData.isPermanent
        ? "영구"
        : formData.endDate
          ? formatDateString(formData.endDate)
          : "-",
    });
    close();
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 {isAdd && "*"}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="이름 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사유 {isAdd && "*"}
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
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
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500",
                      !formData.startDate && "text-gray-400"
                    )}
                  >
                    {formData.startDate
                      ? format(formData.startDate, "yyyy년 MM월 dd일", {
                          locale: ko,
                        })
                      : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, startDate: date })
                    }
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={formData.isPermanent}
                    className={cn(
                      "w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed",
                      !formData.endDate && !formData.isPermanent && "text-gray-400"
                    )}
                  >
                    {formData.isPermanent
                      ? "영구 제재"
                      : formData.endDate
                        ? format(formData.endDate, "yyyy년 MM월 dd일", {
                            locale: ko,
                          })
                        : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, endDate: date })
                    }
                    locale={ko}
                    disabled={(date) =>
                      formData.startDate ? date < formData.startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="permanent"
              checked={formData.isPermanent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isPermanent: e.target.checked,
                  endDate: e.target.checked ? undefined : formData.endDate,
                })
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

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={close}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-semibold ${
              isAdd
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isAdd ? "추가" : "저장"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
