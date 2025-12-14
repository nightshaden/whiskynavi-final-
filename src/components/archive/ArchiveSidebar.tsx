"use client";

import { X } from "lucide-react";
import { useState } from "react";
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

interface FilterState {
  brands: string[];
  maltTypes: string[];
  distilleries: string[];
  distillerySearch: string;
  caskTypes: string[];
  abv: [number, number];
  vintage: [number, number];
  age: [number, number];
}

const BRAND_OPTIONS = [
  { value: "whiskynavi", label: "위스키나비" },
  { value: "tails", label: "더 위스키테일즈" },
  { value: "trail", label: "트레일 앤 테일" },
  { value: "together", label: "투게더 인 스피릿" },
];

const MALT_OPTIONS = [
  { value: "single-malt", label: "싱글 몰트" },
  { value: "single-grain", label: "싱글 그레인" },
  { value: "blended-malt", label: "블렌디드 몰트" },
  { value: "etc", label: "etc" },
];

const DISTILLERY_OPTIONS = [
  { value: "macallan", label: "맥켈란" },
  { value: "balvenie", label: "발베니" },
];

export function ArchiveSidebar({ params }: ArchiveSidebarProps) {
  console.log("bottleParams", params);
  const [filters, setFilters] = useState<FilterState>({
    brands: ["whiskynavi"],
    maltTypes: ["single-malt"],
    distilleries: [],
    distillerySearch: "",
    caskTypes: [],
    abv: [0, 100],
    vintage: [1900, 2025],
    age: [3, 50],
  });
  console.log("test", filters.distilleries);
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
        value={filters.brands}
        onChange={(val) => setFilters((prev) => ({ ...prev, brands: val }))}
        containerClassName="mb-3"
        items={BRAND_OPTIONS}
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
              {BRAND_OPTIONS.map((brand) => (
                <div
                  key={brand.value}
                  className="flex items-center gap-2 group"
                >
                  <Checkbox
                    id={`brand-${brand.value}`}
                    checked={filters.brands.includes(brand.value)}
                    onCheckedChange={() => toggleBrand(brand.value)}
                    className="border-white/30 bg-white/10 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor={`brand-${brand.value}`}
                    className="text-white/90 typo-regular-14 group-hover:text-white cursor-pointer"
                  >
                    {brand.label}
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
              {MALT_OPTIONS.map((malt) => (
                <div key={malt.value} className="flex items-center gap-2 group">
                  <Checkbox
                    id={`malt-${malt.value}`}
                    checked={filters.maltTypes.includes(malt.value)}
                    onCheckedChange={() => toggleMaltType(malt.value)}
                    className="border-white/30 bg-white/10 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor={`malt-${malt.value}`}
                    className="text-white/90 typo-regular-14 group-hover:text-white cursor-pointer"
                  >
                    {malt.label}
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
                items={DISTILLERY_OPTIONS}
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
                items={MALT_OPTIONS}
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

        {/* 숙성 년수 슬라이더 */}
        <AccordionItem value="age" className="border-white/20">
          <AccordionTrigger className="text-white typo-medium-16 hover:no-underline py-4">
            숙성 년수
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  type="number"
                  value={filters.age[0]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      age: [Number(e.target.value), prev.age[1]],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">년</span>
                <span className="text-white/60">–</span>
                <Input
                  type="number"
                  value={filters.age[1]}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      age: [prev.age[0], Number(e.target.value)],
                    }))
                  }
                  className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
                />
                <span className="text-white/60 typo-regular-14">년</span>
              </div>
              <Slider
                value={filters.age}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    age: value as [number, number],
                  }))
                }
                min={3}
                max={50}
                step={1}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
