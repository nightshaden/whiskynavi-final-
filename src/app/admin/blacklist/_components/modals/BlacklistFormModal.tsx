"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import type { BlacklistRequest } from "@/apis/apis";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBlacklistForm } from "../hooks/useBlacklistForm";
import UserSearchInput from "../UserSearchInput";

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

export default function BlacklistFormModal({
  isOpen,
  close,
  mode,
  initialData,
  onSubmit,
}: BlacklistFormModalProps) {
  const { formState, dispatch, isPending, handleSubmit } = useBlacklistForm({
    mode,
    initialData,
    onSubmit,
  });

  const isAdd = mode === "add";

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
            <UserSearchInput
              onSelect={(user) =>
                dispatch({
                  type: "SET_USER",
                  payload: { userId: user.id.toString(), name: user.name },
                })
              }
              onClear={() => dispatch({ type: "CLEAR_USER" })}
            />
          )}

          {!isAdd && (
            <div className="space-y-1.5">
              <Label>이름</Label>
              <div className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700">
                {formState.name}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reason">사유 *</Label>
            <Textarea
              id="reason"
              value={formState.reason}
              onChange={(e) =>
                dispatch({ type: "SET_REASON", payload: e.target.value })
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
                      !formState.startAt && "text-gray-400",
                    )}
                  >
                    {formState.startAt
                      ? format(formState.startAt, "yyyy년 MM월 dd일", {
                          locale: ko,
                        })
                      : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.startAt}
                    onSelect={(date) =>
                      dispatch({ type: "SET_START_DATE", payload: date })
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
                    disabled={formState.isPermanent}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100",
                      !formState.endAt &&
                        !formState.isPermanent &&
                        "text-gray-400",
                    )}
                  >
                    {formState.isPermanent
                      ? "영구 제재"
                      : formState.endAt
                        ? format(formState.endAt, "yyyy년 MM월 dd일", {
                            locale: ko,
                          })
                        : "날짜 선택"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.endAt ?? undefined}
                    onSelect={(date) =>
                      dispatch({ type: "SET_END_DATE", payload: date ?? null })
                    }
                    locale={ko}
                    disabled={(date) =>
                      formState.startAt ? date < formState.startAt : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="permanent"
              checked={formState.isPermanent}
              onCheckedChange={(checked) =>
                dispatch({
                  type: "TOGGLE_PERMANENT",
                  payload: checked === true,
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
            disabled={isPending}
          >
            {isPending ? "처리 중..." : isAdd ? "추가" : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
