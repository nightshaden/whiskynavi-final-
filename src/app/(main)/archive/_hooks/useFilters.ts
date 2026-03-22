"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FILTER_DEFAULTS, type FilterState } from "../_types";
import {
  buildQueryString,
  convertFiltersToQueries,
  parseFiltersFromSearchParams,
} from "../_utils";

export interface UseFiltersReturn {
  filters: FilterState;
  isPending: boolean;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  toggleBrand: (brandId: string) => void;
  toggleMaltType: (maltId: string) => void;
  removeActiveFilter: (type: keyof FilterState, value: string) => void;
  updateKeyword: (keyword: string) => void;
  updateDistilleries: (values: string[]) => void;
  updateCaskTypes: (values: string[]) => void;
  updateAbv: (value: [number, number]) => void;
  updateVintage: (value: [number, number]) => void;
}

/**
 * 필터 상태 관리 및 URL 동기화를 담당하는 훅
 */
export function useFilters(): UseFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);
  const [isPending, startTransition] = useTransition();
  const initialKeyword = new URLSearchParams(searchParams.toString()).get("keyword") ?? "";
  const prevKeywordRef = useRef(initialKeyword);

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

    const keywordChanged = filters.keyword !== prevKeywordRef.current;
    const debounceMs = keywordChanged
      ? FILTER_DEFAULTS.KEYWORD_DEBOUNCE_MS
      : FILTER_DEFAULTS.DEBOUNCE_MS;

    const timeoutId = setTimeout(() => {
      prevKeywordRef.current = filters.keyword;
      const queries = convertFiltersToQueries(filters);
      const queryString = buildQueryString(queries);
      startTransition(() => {
        router.push(`/archive${queryString ? `?${queryString}` : ""}`, {
          scroll: false,
        });
      });
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

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

  // 통합검색어 업데이트
  const updateKeyword = useCallback((keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }));
  }, []);

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
    isPending,
    setFilters,
    toggleBrand,
    toggleMaltType,
    removeActiveFilter,
    updateKeyword,
    updateDistilleries,
    updateCaskTypes,
    updateAbv,
    updateVintage,
  };
}
