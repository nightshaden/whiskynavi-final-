"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";
import type { BottleParams } from "@/apis/apis";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SearchableDropdown from "../ui/searchable-dropdown";
import { Slider } from "../ui/slider";

interface ArchiveSidebarProps {
  params: BottleParams;
}

interface FilterState extends BottleParams {
  abv: [number, number];
  vintage: [number, number];
}

export function ArchiveSidebar({ params }: ArchiveSidebarProps) {
  const allValues = useMemo(
    () =>
      Array.from(
        new Set(
          (Object.keys(params) as (keyof BottleParams)[]).flatMap(
            (key) => params[key as keyof BottleParams],
          ),
        ),
      ),
    [params],
  );

  // 값이 어느 카테고리에 속하는지 찾는 함수 (brands 우선)
  const findCategory = (value: string): keyof BottleParams | null => {
    // brands를 우선적으로 체크 (중복 값이 있을 경우 brands에 추가)
    if (params.brands.includes(value)) {
      return "brands";
    }
    for (const key of Object.keys(params) as (keyof BottleParams)[]) {
      if (params[key].includes(value)) {
        return key;
      }
    }
    return null;
  };

  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    distilleries: [],
    names: [],
    series: [],
    companies: [],
    maltTypes: ["single malt"],
    caskTypes: [],
    abv: [0, 100],
    vintage: [1900, 2025],
  });
  console.log("filters", filters);
  // 전체 검색에서 현재 선택된 모든 값들
  const allSelectedValues = useMemo(
    () => [
      ...filters.brands,
      ...filters.distilleries,
      ...filters.names,
      ...filters.series,
      ...filters.companies,
      ...filters.maltTypes,
      ...filters.caskTypes,
    ],
    [filters],
  );

  // 전체 검색 onChange 핸들러
  const handleGlobalSearchChange = (newValues: string[]) => {
    // 새로 추가된 값 찾기
    const addedValues = newValues.filter((v) => !allSelectedValues.includes(v));
    // 제거된 값 찾기
    const removedValues = allSelectedValues.filter(
      (v) => !newValues.includes(v),
    );

    setFilters((prev) => {
      const updated = { ...prev };

      // 추가된 값을 해당 카테고리에 추가
      for (const value of addedValues) {
        const category = findCategory(value);
        if (category && Array.isArray(updated[category])) {
          updated[category] = [...(updated[category] as string[]), value];
        }
      }

      // 제거된 값을 해당 카테고리에서 제거
      for (const value of removedValues) {
        for (const key of Object.keys(updated) as (keyof FilterState)[]) {
          const arr = updated[key];
          if (Array.isArray(arr) && typeof arr[0] === "string") {
            (updated[key] as string[]) = (arr as string[]).filter(
              (v) => v !== value,
            );
          }
        }
      }

      return updated;
    });
  };

  const toggleBrand = (brandId: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter((id) => id !== brandId)
        : [...prev.brands, brandId],
    }));
  };

  const toggleMaltType = (maltId: string) => {
    setFilters((prev) => ({
      ...prev,
      maltTypes: prev.maltTypes.includes(maltId)
        ? prev.maltTypes.filter((id) => id !== maltId)
        : [...prev.maltTypes, maltId],
    }));
  };

  const removeActiveFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const currentValue = prev[type];
      // Only filter if it's a string array (not a tuple)
      if (Array.isArray(currentValue) && typeof currentValue[0] === "string") {
        return {
          ...prev,
          [type]: currentValue.filter((id) => id !== value),
        } as FilterState;
      }
      return prev;
    });
  };

  return (
    <div className="py-6 px-5 border-[0.85px] border-white border-opacity-20 w-[310px] bg-[#282E39] h-fit">
      {/* 검색 섹션 */}
      <h2 className="typo-bold-24 text-white mb-4">보틀 검색</h2>

      <SearchableDropdown
        placeholder="보틀 이름, 시리즈명으로 검색하기"
        value={allSelectedValues}
        onChange={handleGlobalSearchChange}
        containerClassName="mb-3"
        items={allValues}
      />
      <div className="flex flex-wrap gap-1">
        {/* 활성 필터 태그 */}
        {filters.brands.map((brand) => (
          <Badge key={brand} className="flex items-center">
            <button
              type="button"
              onClick={() => removeActiveFilter("brands", brand)}
            >
              <X className="w-3 h-3" />
            </button>
            <span>{brand}</span>
          </Badge>
        ))}
        {filters.maltTypes.map((maltType) => (
          <Badge key={maltType} className="flex items-center bg-amber-800">
            <button
              type="button"
              onClick={() => removeActiveFilter("maltTypes", maltType)}
            >
              <X className="w-3 h-3" />
            </button>
            <span>{maltType}</span>
          </Badge>
        ))}
        {filters.distilleries.map((distillery) => (
          <Badge
            color="red"
            key={distillery}
            className="flex items-center bg-orange-400"
          >
            <button
              type="button"
              onClick={() => removeActiveFilter("distilleries", distillery)}
            >
              <X className="w-3 h-3" />
            </button>
            <span>{distillery}</span>
          </Badge>
        ))}
        {filters.caskTypes.map((caskType) => (
          <Badge
            color="red"
            key={caskType}
            className="flex items-center bg-amber-950"
          >
            <button
              type="button"
              onClick={() => removeActiveFilter("caskTypes", caskType)}
            >
              <X className="w-3 h-3" />
            </button>
            <span>{caskType}</span>
          </Badge>
        ))}
      </div>
      <Accordion
        type="multiple"
        defaultValue={[
          "brand",
          "malt",
          "distillery",
          "cask",
          "abv",
          "vintage",
          "age",
        ]}
        className="space-y-0"
      >
        {/* 브랜드 필터 */}
        <AccordionItem value="brand" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            브랜드
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pb-4">
              {params.brands.map((brand) => (
                <div key={brand} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={filters.brands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                    className="border-white/30 bg-white/10 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor={`brand-${brand}`}
                    className="text-white/90 typo-regular-14 group-hover:text-white cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 몰트 필터 */}
        <AccordionItem value="malt" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            몰트
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2.5 pb-4">
              {params.maltTypes.map((malt) => (
                <div key={malt} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`malt-${malt}`}
                    checked={filters.maltTypes.includes(malt)}
                    onCheckedChange={() => toggleMaltType(malt)}
                    className="border-white/30 bg-white/10 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor={`malt-${malt}`}
                    className="text-white/90 typo-regular-14 group-hover:text-white cursor-pointer"
                  >
                    {malt}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 증류소 필터 */}
        <AccordionItem value="distillery" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            증류소
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative mb-4">
              <SearchableDropdown
                placeholder="증류소명으로 검색하기"
                value={filters.distilleries}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, distilleries: val }))
                }
                containerClassName="mb-3"
                items={params.distilleries}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 캐스크 종류 필터 */}
        <AccordionItem value="cask" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            캐스크 종류
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-4">
              <SearchableDropdown
                placeholder="캐스크 타입으로 검색하기"
                value={filters.caskTypes}
                onChange={(val) =>
                  setFilters((prev) => ({ ...prev, caskTypes: val }))
                }
                containerClassName="mb-3"
                items={params.caskTypes}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 도수 슬라이더 */}
        <AccordionItem value="abv" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            도수
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="number"
                  value={filters.abv[0]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      abv: [Number(e.target.value), prev.abv[1]],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">%</span>
                <span className="text-white/60">–</span>
                <Input
                  type="number"
                  value={filters.abv[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      abv: [prev.abv[0], Number(e.target.value)],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">%</span>
              </div>
              <Slider
                value={filters.abv}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    abv: value as [number, number],
                  }))
                }
                min={0}
                max={100}
                step={1}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 빈티지 슬라이더 */}
        <AccordionItem value="vintage" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            빈티지
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="number"
                  value={filters.vintage[0]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      vintage: [Number(e.target.value), prev.vintage[1]],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">년</span>
                <span className="text-white/60">–</span>
                <Input
                  type="number"
                  value={filters.vintage[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      vintage: [prev.vintage[0], Number(e.target.value)],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">년</span>
              </div>
              <Slider
                value={filters.vintage}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    vintage: value as [number, number],
                  }))
                }
                min={1900}
                max={2025}
                step={1}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
