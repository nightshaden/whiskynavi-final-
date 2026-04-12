"use client";

import { createContext, use } from "react";
import type { useFilters } from "../_hooks/useFilters";

type FilterContextValue = ReturnType<typeof useFilters>;

export const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilterContext() {
  const ctx = use(FilterContext);
  if (!ctx)
    throw new Error("useFilterContext must be used within FilterProvider");
  return ctx;
}
