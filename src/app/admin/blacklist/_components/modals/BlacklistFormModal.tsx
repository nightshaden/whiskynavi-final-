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

export type BlacklistFormData = {
  userId?: number;
  name?: string;
  reason: string;
  startAt?: string;
  endAt?: string;
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

function formatDateString(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
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
    endAt: parseDate(initialData?.endAt),
    isPermanent: !initialData?.endAt,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdd = mode === "add";

  const handleSubmit = async () => {
    if (isAdd && !formData.userId) {
      alert("사용자 ID를 입력해주세요.");
      return;
    }
    if (!formData.reason) {
      alert("사유를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        userId: formData.userId ? Number(formData.userId) : undefined,
        name: formData.name,
        reason: formData.reason,
        startAt: formData.startAt ? formatDateString(formData.startAt) : undefined,
        endAt: formData.isPermanent
          ? undefined
          : formData.endAt
            ? formatDateString(formData.endAt)
            : undefined,
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
              <Label htmlFor="userId">사용자 ID *</Label>
              <Input
                id="userId"
                type="number"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                placeholder="사용자 ID 입력"
              />
            </div>
          )}

          {!isAdd && (
            <div className="space-y-1.5">
              <Label>이름</Label>
              <Input value={formData.name} disabled className="bg-gray-100" />
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : isAdd ? "추가" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
