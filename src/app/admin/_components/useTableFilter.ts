"use client";

import { createSearchParams, type AdminSearchParams } from "@/app/admin/_lib/searchParams";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseTableFilterOptions {
  searchParams: AdminSearchParams;
  basePath: string;
}

export function useTableFilter({ searchParams, basePath }: UseTableFilterOptions) {
  const router = useRouter();

  const getFilterValue = useCallback(
    (key: string) => {
      const value = searchParams[key];
      return typeof value === "string" ? value : "all";
    },
    [searchParams],
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = createSearchParams(searchParams);
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

  return { getFilterValue, updateFilter };
}
