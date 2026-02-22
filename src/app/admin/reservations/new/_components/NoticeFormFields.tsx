"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type {
  BottleAdminResponse,
  BottleReservationNoticeResponse,
} from "@/apis/generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CurrencyInput from "../../../_components/CurrencyInput";
import DateTimePicker from "../../../_components/DateTimePicker";
import { ROLE_LABEL_MAP } from "../../../constants";

const ROLE_OPTIONS = Object.entries(ROLE_LABEL_MAP) as [string, string][];

interface GradeCondition {
  applicableFrom: string;
  requiredRole: string;
}

interface NoticeFormFieldsProps {
  defaultValues?: BottleReservationNoticeResponse;
  bottles: BottleAdminResponse[];
}

export default function NoticeFormFields({
  defaultValues,
  bottles,
}: NoticeFormFieldsProps) {
  const [gradeConditions, setGradeConditions] = useState<GradeCondition[]>(
    defaultValues?.gradeConditions?.map((gc) => ({
      applicableFrom: gc.applicableFrom ?? "",
      requiredRole: gc.requiredRole ?? "",
    })) ?? [],
  );

  const addCondition = () => {
    setGradeConditions((prev) => [
      ...prev,
      { applicableFrom: "", requiredRole: "" },
    ]);
  };

  const removeCondition = (idx: number) => {
    setGradeConditions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateCondition = (
    idx: number,
    field: keyof GradeCondition,
    value: string,
  ) => {
    setGradeConditions((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <input
        type="hidden"
        name="gradeConditions"
        value={
          gradeConditions.length > 0
            ? JSON.stringify(
                gradeConditions
                  .filter((c) => c.requiredRole && c.applicableFrom)
                  .map((c) => ({
                    applicableFrom: new Date(c.applicableFrom).toISOString(),
                    requiredRole: c.requiredRole,
                  })),
              )
            : ""
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제품 <span className="text-red-500">*</span>
          </label>
          <Select
            name="bottleId"
            defaultValue={
              defaultValues?.bottleId != null
                ? String(defaultValues.bottleId)
                : undefined
            }
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="제품을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {bottles.map((bottle) => (
                <SelectItem
                  key={bottle.id}
                  value={String(bottle.id)}
                >
                  {bottle.name} (ID: {bottle.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가격 <span className="text-red-500">*</span>
          </label>
          <CurrencyInput
            name="price"
            defaultValue={defaultValues?.price}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="가격을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            예약 시작일 <span className="text-red-500">*</span>
          </label>
          <DateTimePicker
            name="reservationStartAt"
            defaultValue={defaultValues?.reservationStartAt}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            예약 종료일 <span className="text-red-500">*</span>
          </label>
          <DateTimePicker
            name="reservationEndAt"
            defaultValue={defaultValues?.reservationEndAt}
            required
          />
        </div>
      </div>

      {/* 등급 조건 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            등급 조건 (선택)
          </label>
          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs font-medium cursor-pointer"
          >
            <Plus size={14} />
            조건 추가
          </button>
        </div>

        {gradeConditions.length === 0 && (
          <p className="text-sm text-gray-400">등급 조건이 없습니다.</p>
        )}

        <div className="space-y-3">
          {gradeConditions.map((cond, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">역할</label>
                <Select
                  value={cond.requiredRole || undefined}
                  onValueChange={(val) =>
                    updateCondition(idx, "requiredRole", val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  적용 시작일
                </label>
                <DateTimePicker
                  value={cond.applicableFrom}
                  onChange={(iso) =>
                    updateCondition(idx, "applicableFrom", iso)
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => removeCondition(idx)}
                className="mt-5 p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
