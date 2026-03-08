"use client";

import type { BottleParams } from "@/apis/apis";
import SearchableDropdown from "@/components/ui/searchable-dropdown";
import { useCallback, useMemo } from "react";
import { useFilters } from "../../_hooks/useFilters";
import { INITIAL_FILTER_STATE } from "../../_types";
import { extractAllValues } from "../../_utils";
import { AbvFilter } from "./AbvFilter";
import CurrentFilters from "./ActiveFilters";
import { BrandFilter } from "./BrandFilter";
import { CaskTypeFilter } from "./CaskTypeFilter";
import { DistilleryFilter } from "./DistilleryFilter";
import { FilterGroup } from "./FilterGroup";
import { MaltTypeFilter } from "./MaltTypeFilter";
import { VintageFilter } from "./VintageFilter";

interface ArchiveSidebarProps {
  params: BottleParams;
}

const DEFAULT_EXPANDED = [
  "brand",
  "malt",
  "distillery",
  "cask",
  "abv",
  "vintage",
];

export function ArchiveSidebar({ params }: ArchiveSidebarProps) {
  const allValues = useMemo(() => extractAllValues(params), [params]);

  const {
    filters,
    allSelectedValues,
    setFilters,
    toggleBrand,
    toggleMaltType,
    removeActiveFilter,
    handleGlobalSearchChange,
    updateDistilleries,
    updateCaskTypes,
    updateAbv,
    updateVintage,
  } = useFilters({ params });

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, [setFilters]);

  return (
    <aside className="hidden w-80 shrink-0 lg:mr-8 lg:block">
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-bold text-white">보틀 검색</h3>
        <SearchableDropdown
          placeholder="보틀 이름, 시리즈명으로 검색하기"
          value={allSelectedValues}
          onChange={handleGlobalSearchChange}
          containerClassName="mb-3"
          items={allValues}
        />
      </div>

      <CurrentFilters
        filters={filters}
        onRemove={removeActiveFilter}
        onClearAll={clearAllFilters}
      />

      <FilterGroup defaultExpanded={DEFAULT_EXPANDED}>
        <BrandFilter
          brands={params.brands}
          selectedBrands={filters.brands}
          onToggle={toggleBrand}
        />

        <MaltTypeFilter
          maltTypes={params.maltTypes}
          selectedMaltTypes={filters.maltTypes}
          onToggle={toggleMaltType}
        />

        <DistilleryFilter
          distilleries={params.distilleries}
          selectedDistilleries={filters.distilleries}
          onChange={updateDistilleries}
        />

        <CaskTypeFilter
          caskTypes={params.caskTypes}
          selectedCaskTypes={filters.caskTypes}
          onChange={updateCaskTypes}
        />

        <AbvFilter value={filters.abv} onChange={updateAbv} />

        <VintageFilter value={filters.vintage} onChange={updateVintage} />
      </FilterGroup>
    </aside>
  );
}
