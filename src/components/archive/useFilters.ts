"use client";

import type { BottleParams } from "@/apis/apis";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FILTER_DEFAULTS, type FilterState } from "./types";
import {
  buildQueryString,
  convertFiltersToQueries,
  findCategory,
  getAllSelectedValues,
  parseFiltersFromSearchParams,
} from "./utils";

interface UseFiltersOptions {
  params: BottleParams;
}

interface UseFiltersReturn {
  filters: FilterState;
  allSelectedValues: string[];
  // 필터 업데이트 함수들
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  toggleBrand: (brandId: string) => void;
  toggleMaltType: (maltId: string) => void;
  removeActiveFilter: (type: keyof FilterState, value: string) => void;
  handleGlobalSearchChange: (newValues: string[]) => void;
  updateDistilleries: (values: string[]) => void;
  updateCaskTypes: (values: string[]) => void;
  updateAbv: (value: [number, number]) => void;
  updateVintage: (value: [number, number]) => void;
}

/**
 * 필터 상태 관리 및 URL 동기화를 담당하는 훅
 */
export function useFilters({ params }: UseFiltersOptions): UseFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  // URL에서 초기 필터 상태 파싱
  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );

  // 필터 변경 시 URL 업데이트 (디바운스 적용)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      const queries = convertFiltersToQueries(filters);
      const queryString = buildQueryString(queries);
      router.push(`/archive${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    }, FILTER_DEFAULTS.DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

  // 전체 검색에서 현재 선택된 모든 값들
  const allSelectedValues = useMemo(
    () => getAllSelectedValues(filters),
    [filters],
  );

  // 브랜드 토글
  const toggleBrand = useCallback((brandId: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter((id) => id !== brandId)
        : [...prev.brands, brandId],
    }));
  }, []);

  // 몰트 타입 토글
  const toggleMaltType = useCallback((maltId: string) => {
    setFilters((prev) => ({
      ...prev,
      maltTypes: prev.maltTypes.includes(maltId)
        ? prev.maltTypes.filter((id) => id !== maltId)
        : [...prev.maltTypes, maltId],
    }));
  }, []);

  // 활성 필터 제거
  const removeActiveFilter = useCallback(
    (type: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const currentValue = prev[type];
        if (
          Array.isArray(currentValue) &&
          typeof currentValue[0] === "string"
        ) {
          return {
            ...prev,
            [type]: currentValue.filter((id) => id !== value),
          } as FilterState;
        }
        return prev;
      });
    },
    [],
  );

  // 전체 검색 onChange 핸들러
  const handleGlobalSearchChange = useCallback(
    (newValues: string[]) => {
      const currentSelected = getAllSelectedValues(filters);
      const addedValues = newValues.filter(
        (v) => !currentSelected.includes(v),
      );
      const removedValues = currentSelected.filter(
        (v) => !newValues.includes(v),
      );

      setFilters((prev) => {
        const updated = { ...prev };

        // 추가된 값을 해당 카테고리에 추가
        for (const value of addedValues) {
          const category = findCategory(value, params);
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
    },
    [filters, params],
  );

  // 개별 필터 업데이트 함수들
  const updateDistilleries = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, distilleries: values }));
  }, []);

  const updateCaskTypes = useCallback((values: string[]) => {
    setFilters((prev) => ({ ...prev, caskTypes: values }));
  }, []);

  const updateAbv = useCallback((value: [number, number]) => {
    setFilters((prev) => ({ ...prev, abv: value }));
  }, []);

  const updateVintage = useCallback((value: [number, number]) => {
    setFilters((prev) => ({ ...prev, vintage: value }));
  }, []);

  return {
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
  };
}

