"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTableFilterOptions {
  searchParams: Record<string, string | undefined>;
  basePath: string;
}

export function useTableFilter({
  searchParams,
  basePath,
}: UseTableFilterOptions) {
  const router = useRouter();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const filterRef = useRef<HTMLTableSectionElement>(null);

  const toggleFilter = useCallback(
    (name: string) => setOpenFilter((prev) => (prev === name ? null : name)),
    [],
  );

  const closeFilter = useCallback(() => setOpenFilter(null), []);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!openFilter) return;
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openFilter]);

  const getFilterValue = useCallback(
    (key: string) => searchParams[key] || "all",
    [searchParams],
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      const currentValue = params.get(key);
      if (value === "all" || value === currentValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.set("page", "1");
      router.push(`${basePath}?${params.toString()}`);
    },
    [searchParams, basePath, router],
  );

  return {
    openFilter,
    filterRef,
    toggleFilter,
    closeFilter,
    getFilterValue,
    updateFilter,
  };
}
