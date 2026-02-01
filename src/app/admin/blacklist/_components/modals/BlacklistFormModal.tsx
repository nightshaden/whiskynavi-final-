"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { BlacklistItem } from "../../../_data/mockData";

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
    startAt: parseDate(initialData?.startAt ?? ""),
    endAt: parseDate(initialData?.endAt ?? ""),
    isPermanent: initialData?.endAt === "영구",
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
      startAt: formData.startAt ? formatDateString(formData.startAt) : "-",
      endAt: formData.isPermanent
        ? "영구"
        : formData.endAt
          ? formatDateString(formData.endAt)
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
          <div className="space-y-1.5">
            <Label htmlFor="name">이름 {isAdd && "*"}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="이름 입력"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">사유 {isAdd && "*"}</Label>
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
                      "w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500",
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
                      "w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed",
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
                    selected={formData.endAt}
                    onSelect={(date) =>
                      setFormData({ ...formData, endAt: date })
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
          >
            {isAdd ? "추가" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
