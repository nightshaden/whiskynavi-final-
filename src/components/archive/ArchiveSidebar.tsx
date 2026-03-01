"use client";

import type { BottleParams } from "@/apis/apis";
import { X } from "lucide-react";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { RangeSlider } from "../ui/range-slider";
import SearchableDropdown from "../ui/searchable-dropdown";
import { FILTER_DEFAULTS } from "./types";
import { useFilters } from "./useFilters";
import { extractAllValues } from "./utils";

interface ArchiveSidebarProps {
  params: BottleParams;
}

export function ArchiveSidebar({ params }: ArchiveSidebarProps) {
  // 모든 검색 가능한 값들
  const allValues = useMemo(() => extractAllValues(params), [params]);

  // 필터 상태 및 핸들러
  const {
    filters,
    allSelectedValues,
    toggleBrand,
    toggleMaltType,
    removeActiveFilter,
    handleGlobalSearchChange,
    updateDistilleries,
    updateCaskTypes,
    updateAbv,
    updateVintage,
  } = useFilters({ params });

  return (
    <div className="border-opacity-20 h-fit w-full max-w-[280px] border-[0.85px] border-white bg-[#282E39] px-5 py-6">
      {/* Header */}
      <h2 className="typo-bold-24 mb-4 text-white">보틀 검색</h2>

      {/* GlobalSearch */}
      <SearchableDropdown
        placeholder="보틀 이름, 시리즈명으로 검색하기"
        value={allSelectedValues}
        onChange={handleGlobalSearchChange}
        containerClassName="mb-3"
        items={allValues}
      />

      <ActiveFilters filters={filters} onRemove={removeActiveFilter} />

      <FilterAccordion
        params={params}
        filters={filters}
        onToggleBrand={toggleBrand}
        onToggleMaltType={toggleMaltType}
        onDistilleriesChange={updateDistilleries}
        onCaskTypesChange={updateCaskTypes}
        onAbvChange={updateAbv}
        onVintageChange={updateVintage}
      />
    </div>
  );
}

interface ActiveFiltersProps {
  filters: {
    brands: string[];
    maltTypes: string[];
    distilleries: string[];
    caskTypes: string[];
  };
  onRemove: (
    type: "brands" | "maltTypes" | "distilleries" | "caskTypes",
    value: string,
  ) => void;
}

function ActiveFilters({ filters, onRemove }: ActiveFiltersProps) {
  const filterConfigs = [
    { key: "brands" as const, items: filters.brands, className: "" },
    {
      key: "maltTypes" as const,
      items: filters.maltTypes,
      className: "bg-amber-800",
    },
    {
      key: "distilleries" as const,
      items: filters.distilleries,
      className: "bg-orange-400",
    },
    {
      key: "caskTypes" as const,
      items: filters.caskTypes,
      className: "bg-amber-950",
    },
  ];

  return (
    <div className="flex max-w-[280px] flex-wrap gap-1">
      {filterConfigs.map(({ key, items, className }) =>
        items.map((item) => (
          <Badge
            key={`${key}-${item}`}
            className={`flex items-center ${className}`}
          >
            <button type="button" onClick={() => onRemove(key, item)}>
              <X className="h-3 w-3" />
            </button>
            <span>{item}</span>
          </Badge>
        )),
      )}
    </div>
  );
}

interface FilterAccordionProps {
  params: BottleParams;
  filters: {
    brands: string[];
    maltTypes: string[];
    distilleries: string[];
    caskTypes: string[];
    abv: [number, number];
    vintage: [number, number];
  };
  onToggleBrand: (brandId: string) => void;
  onToggleMaltType: (maltId: string) => void;
  onDistilleriesChange: (values: string[]) => void;
  onCaskTypesChange: (values: string[]) => void;
  onAbvChange: (value: [number, number]) => void;
  onVintageChange: (value: [number, number]) => void;
}

function FilterAccordion({
  params,
  filters,
  onToggleBrand,
  onToggleMaltType,
  onDistilleriesChange,
  onCaskTypesChange,
  onAbvChange,
  onVintageChange,
}: FilterAccordionProps) {
  const defaultOpenSections = [
    "brand",
    "malt",
    "distillery",
    "cask",
    "abv",
    "vintage",
    "age",
  ];

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpenSections}
      className="space-y-0"
    >
      <BrandFilter
        brands={params.brands}
        selectedBrands={filters.brands}
        onToggle={onToggleBrand}
      />

      <MaltTypeFilter
        maltTypes={params.maltTypes}
        selectedMaltTypes={filters.maltTypes}
        onToggle={onToggleMaltType}
      />

      <DistilleryFilter
        distilleries={params.distilleries}
        selectedDistilleries={filters.distilleries}
        onChange={onDistilleriesChange}
      />

      <CaskTypeFilter
        caskTypes={params.caskTypes}
        selectedCaskTypes={filters.caskTypes}
        onChange={onCaskTypesChange}
      />

      <AbvFilter value={filters.abv} onChange={onAbvChange} />

      <VintageFilter value={filters.vintage} onChange={onVintageChange} />
    </Accordion>
  );
}

// ============================================================================
// Individual Filter Components
// ============================================================================

interface CheckboxFilterProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function CheckboxFilterItem({
  id,
  label,
  checked,
  onToggle,
}: CheckboxFilterProps) {
  return (
    <div className="group flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="border-white/30 bg-white/10 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
      />
      <Label
        htmlFor={id}
        className="typo-regular-14 cursor-pointer text-white/90 group-hover:text-white"
      >
        {label}
      </Label>
    </div>
  );
}

interface BrandFilterProps {
  brands: string[];
  selectedBrands: string[];
  onToggle: (brandId: string) => void;
}

function BrandFilter({ brands, selectedBrands, onToggle }: BrandFilterProps) {
  return (
    <AccordionItem value="brand" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        브랜드
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2.5 pb-4">
          {brands.map((brand) => (
            <CheckboxFilterItem
              key={brand}
              id={`brand-${brand}`}
              label={brand}
              checked={selectedBrands.includes(brand)}
              onToggle={() => onToggle(brand)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface MaltTypeFilterProps {
  maltTypes: string[];
  selectedMaltTypes: string[];
  onToggle: (maltId: string) => void;
}

function MaltTypeFilter({
  maltTypes,
  selectedMaltTypes,
  onToggle,
}: MaltTypeFilterProps) {
  return (
    <AccordionItem value="malt" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        몰트
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2.5 pb-4">
          {maltTypes.map((malt) => (
            <CheckboxFilterItem
              key={malt}
              id={`malt-${malt}`}
              label={malt}
              checked={selectedMaltTypes.includes(malt)}
              onToggle={() => onToggle(malt)}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface DistilleryFilterProps {
  distilleries: string[];
  selectedDistilleries: string[];
  onChange: (values: string[]) => void;
}

function DistilleryFilter({
  distilleries,
  selectedDistilleries,
  onChange,
}: DistilleryFilterProps) {
  return (
    <AccordionItem value="distillery" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        증류소
      </AccordionTrigger>
      <AccordionContent>
        <div className="relative mb-4">
          <SearchableDropdown
            placeholder="증류소명으로 검색하기"
            value={selectedDistilleries}
            onChange={onChange}
            containerClassName="mb-3"
            items={distilleries}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface CaskTypeFilterProps {
  caskTypes: string[];
  selectedCaskTypes: string[];
  onChange: (values: string[]) => void;
}

function CaskTypeFilter({
  caskTypes,
  selectedCaskTypes,
  onChange,
}: CaskTypeFilterProps) {
  return (
    <AccordionItem value="cask" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        캐스크 종류
      </AccordionTrigger>
      <AccordionContent>
        <div className="mb-4">
          <SearchableDropdown
            placeholder="캐스크 타입으로 검색하기"
            value={selectedCaskTypes}
            onChange={onChange}
            containerClassName="mb-3"
            items={caskTypes}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface AbvFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

function AbvFilter({ value, onChange }: AbvFilterProps) {
  return (
    <AccordionItem value="abv" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        도수
      </AccordionTrigger>
      <AccordionContent>
        <RangeSlider
          value={value}
          onChange={onChange}
          min={FILTER_DEFAULTS.ABV_MIN}
          max={FILTER_DEFAULTS.ABV_MAX}
          unit="%"
        />
      </AccordionContent>
    </AccordionItem>
  );
}

interface VintageFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

function VintageFilter({ value, onChange }: VintageFilterProps) {
  return (
    <AccordionItem value="vintage" className="border-white/20">
      <AccordionTrigger className="typo-medium-16 py-4 text-white hover:no-underline">
        빈티지
      </AccordionTrigger>
      <AccordionContent>
        <RangeSlider
          value={value}
          onChange={onChange}
          min={FILTER_DEFAULTS.VINTAGE_MIN}
          max={FILTER_DEFAULTS.VINTAGE_MAX}
          unit="년"
        />
      </AccordionContent>
    </AccordionItem>
  );
}
