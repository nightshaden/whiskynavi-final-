"use client";

import type { BottleAdminResponse } from "@/apis/generated/api";
import { Label } from "@/components/ui/label";
import { CalendarDays, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import CurrencyInput from "../_components/CurrencyInput";

interface AdminProductDetailEditProps {
  defaultValues?: BottleAdminResponse;
}

const FALLBACK_IMAGE = "/default-bottle-v2.png";

export default function AdminProductDetailEdit({
  defaultValues,
}: AdminProductDetailEditProps) {
  const [extraInfos, setExtraInfos] = useState<Record<string, string>>(
    (defaultValues?.extraInfos as Record<string, string>) ?? {},
  );
  const newExtraInfoKeyRef = useRef<HTMLInputElement>(null);
  const newExtraInfoValueRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(
    defaultValues?.imgUrl,
  );
  const currentImage = previewUrl || FALLBACK_IMAGE;

  const handleAddImage = (file: File) => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(undefined);
  };

  const handleAddExtraInfo = () => {
    const key = newExtraInfoKeyRef.current?.value.trim() ?? "";
    const value = newExtraInfoValueRef.current?.value.trim() ?? "";
    if (key && value) {
      setExtraInfos((prev) => ({ ...prev, [key]: value }));
      newExtraInfoKeyRef.current!.value = "";
      newExtraInfoValueRef.current!.value = "";
    }
  };

  const handleRemoveExtraInfo = (key: string) => {
    setExtraInfos((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <div className="rounded-lg bg-white p-4">
      <input
        type="hidden"
        name="extraInfos"
        value={JSON.stringify(extraInfos)}
      />

      <div className="flex gap-6 divide-x divide-gray-200">
        {/* 왼쪽: 모든 필드 (설명 제외) */}
        <div className="flex-1 space-y-2 pr-6">
          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">제품명</Label>
            <input
              type="text"
              name="name"
              defaultValue={defaultValues?.name}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">브랜드</Label>
            <input
              type="text"
              name="brand"
              defaultValue={defaultValues?.brand}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">시리즈</Label>
            <input
              type="text"
              name="series"
              defaultValue={defaultValues?.series}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">회사</Label>
            <input
              type="text"
              name="company"
              defaultValue={defaultValues?.company}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">증류소</Label>
            <input
              type="text"
              name="distillery"
              defaultValue={defaultValues?.distillery}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">몰트 타입</Label>
            <input
              type="text"
              name="maltType"
              defaultValue={defaultValues?.maltType}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">캐스크 타입</Label>
            <input
              type="text"
              name="caskType"
              defaultValue={defaultValues?.caskType}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">캐스크 번호</Label>
            <input
              type="text"
              name="caskNumber"
              defaultValue={defaultValues?.caskNumber}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">
              알코올 도수 (%)
            </Label>
            <input
              type="number"
              name="abv"
              step="0.1"
              defaultValue={defaultValues?.abv}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">용량 (ml)</Label>
            <input
              type="number"
              name="capacity"
              defaultValue={defaultValues?.capacity}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-sm text-gray-700">증류 날짜</Label>
            <div className="relative flex-1">
              <input
                type="date"
                name="distillationDate"
                defaultValue={defaultValues?.distillationDate}
                className="w-full rounded border border-gray-300 py-1 pr-2 pl-8 text-sm"
              />
              <CalendarDays
                className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                size={14}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label className="w-32 text-sm text-gray-700">병입 날짜</Label>
            <div className="relative flex-1">
              <input
                type="date"
                name="bottledDate"
                defaultValue={defaultValues?.bottledDate}
                className="w-full rounded border border-gray-300 py-1 pr-2 pl-8 text-sm"
              />
              <CalendarDays
                className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                size={14}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">재고 수량</Label>
            <input
              type="number"
              name="stockQuantity"
              defaultValue={defaultValues?.stockQuantity}
              className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">공급가</Label>
            <CurrencyInput
              name="supplyPrice"
              defaultValue={defaultValues?.supplyPrice}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Label className="w-32 text-sm text-gray-700">소비자가</Label>
            <CurrencyInput
              name="consumerPrice"
              defaultValue={defaultValues?.consumerPrice}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          {/* 추가 정보 */}
          <div className="border-t pt-2">
            <Label className="mb-2 block text-sm font-semibold text-gray-700">
              추가 정보
            </Label>
            <div className="space-y-2">
              {Object.entries(extraInfos).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => {
                      setExtraInfos((prev) => {
                        const next = { ...prev };
                        const oldValue = next[key];
                        delete next[key];
                        next[e.target.value] = oldValue;
                        return next;
                      });
                    }}
                    className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="키"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      setExtraInfos((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }));
                    }}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="값"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraInfo(key)}
                    className="cursor-pointer px-2 py-1 text-red-600 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}

              {/* 새 추가 정보 입력 */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  ref={newExtraInfoKeyRef}
                  className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                  placeholder="새 키"
                />
                <input
                  type="text"
                  ref={newExtraInfoValueRef}
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  placeholder="새 값"
                />
                <button
                  type="button"
                  onClick={handleAddExtraInfo}
                  className="cursor-pointer rounded bg-amber-600 px-2 py-1 text-white transition-colors hover:bg-amber-700"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 중간: 설명 */}
        <div className="flex-1 px-6">
          <div className="mb-1 text-sm text-gray-600">설명</div>
          <textarea
            name="description"
            defaultValue={defaultValues?.description}
            rows={12}
            placeholder="설명을 입력하세요."
            className="w-full resize-y rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"
          />
        </div>

        {/* 오른쪽: 이미지 */}
        <div className="flex flex-1 flex-col pl-6">
          {/* 큰 이미지 */}
          <div className="group relative mb-4">
            <Image
              src={currentImage}
              width={320}
              height={320}
              alt={defaultValues?.name ?? ""}
              className="h-80 w-full rounded border border-gray-200 object-cover"
              unoptimized={currentImage.startsWith("blob:")}
            />
            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded bg-black opacity-0 transition-opacity group-hover:opacity-100">
              <Label className="flex cursor-pointer items-center gap-2 rounded bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100">
                <Upload size={18} />
                이미지 추가
                <input
                  type="file"
                  name="labelImg"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleAddImage(file);
                    }
                  }}
                  className="hidden"
                />
              </Label>
            </div>
          </div>
          {/* 썸네일 리스트 */}
          {previewUrl && (
            <div className="flex flex-wrap gap-2">
              <div className="group/thumb relative">
                <Image
                  src={previewUrl}
                  width={64}
                  height={64}
                  alt="Product thumbnail"
                  unoptimized={previewUrl.startsWith("blob:")}
                  className="h-16 w-16 rounded border-2 border-amber-600 object-cover ring-2 ring-amber-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
