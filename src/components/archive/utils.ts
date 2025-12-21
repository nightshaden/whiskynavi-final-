import type { BottleParams, BottleQueries } from "@/apis/apis";
import { FILTER_DEFAULTS, type FilterState } from "./types";

/**
 * 값이 어느 카테고리에 속하는지 찾는 함수
 * brands를 우선적으로 체크 (중복 값이 있을 경우 brands에 추가)
 */
export function findCategory(
  value: string,
  params: BottleParams,
): keyof BottleParams | null {
  if (params.brands.includes(value)) {
    return "brands";
  }

  for (const key of Object.keys(params) as (keyof BottleParams)[]) {
    if (params[key].includes(value)) {
      return key;
    }
  }

  return null;
}

/**
 * BottleParams에서 모든 고유 값들을 추출
 */
export function extractAllValues(params: BottleParams): string[] {
  return Array.from(
    new Set(
      (Object.keys(params) as (keyof BottleParams)[]).flatMap(
        (key) => params[key],
      ),
    ),
  );
}

/**
 * FilterState를 API BottleQueries 형식으로 변환
 */
export function convertFiltersToQueries(
  filterState: FilterState,
): BottleQueries {
  const queries: BottleQueries = {};

  // 배열 필터를 쉼표로 구분된 문자열로 변환
  const arrayFilters: Array<{
    key: keyof FilterState;
    queryKey: keyof BottleQueries;
  }> = [
    { key: "brands", queryKey: "brand" },
    { key: "distilleries", queryKey: "distillery" },
    { key: "names", queryKey: "name" },
    { key: "series", queryKey: "series" },
    { key: "companies", queryKey: "company" },
    { key: "maltTypes", queryKey: "maltType" },
    { key: "caskTypes", queryKey: "caskType" },
  ];

  for (const { key, queryKey } of arrayFilters) {
    const values = filterState[key] as string[];
    if (values.length > 0) {
      (queries[queryKey] as string) = values.join(",");
    }
  }

  // ABV 범위 (기본값과 다를 때만 추가)
  if (filterState.abv[0] !== FILTER_DEFAULTS.ABV_MIN) {
    queries.abvFrom = filterState.abv[0];
  }
  if (filterState.abv[1] !== FILTER_DEFAULTS.ABV_MAX) {
    queries.abvTo = filterState.abv[1];
  }

  // Vintage 범위 (기본값과 다를 때만 추가)
  if (filterState.vintage[0] !== FILTER_DEFAULTS.VINTAGE_MIN) {
    queries.vintageFrom = filterState.vintage[0];
  }
  if (filterState.vintage[1] !== FILTER_DEFAULTS.VINTAGE_MAX) {
    queries.vintageTo = filterState.vintage[1];
  }

  return queries;
}

/**
 * URL SearchParams에서 FilterState 파싱
 */
export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams,
): FilterState {
  const parseStringArray = (key: string): string[] =>
    searchParams.get(key)?.split(",").filter(Boolean) ?? [];

  const parseNumber = (key: string, defaultValue: number): number => {
    const value = searchParams.get(key);
    if (value === null) return defaultValue;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  };

  return {
    brands: parseStringArray("brand"),
    distilleries: parseStringArray("distillery"),
    names: parseStringArray("name"),
    series: parseStringArray("series"),
    companies: parseStringArray("company"),
    maltTypes:
      parseStringArray("maltType").length > 0
        ? parseStringArray("maltType")
        : [FILTER_DEFAULTS.DEFAULT_MALT_TYPE],
    caskTypes: parseStringArray("caskType"),
    abv: [
      parseNumber("abvFrom", FILTER_DEFAULTS.ABV_MIN),
      parseNumber("abvTo", FILTER_DEFAULTS.ABV_MAX),
    ],
    vintage: [
      parseNumber("vintageFrom", FILTER_DEFAULTS.VINTAGE_MIN),
      parseNumber("vintageTo", FILTER_DEFAULTS.VINTAGE_MAX),
    ],
  };
}

/**
 * BottleQueries를 URLSearchParams 문자열로 변환
 */
export function buildQueryString(queries: BottleQueries): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(queries)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  // 필터 변경 시 첫 페이지로 이동
  params.set("page", "0");

  return params.toString();
}

/**
 * 현재 선택된 모든 필터 값들을 하나의 배열로 합침
 */
export function getAllSelectedValues(filters: FilterState): string[] {
  return [
    ...filters.brands,
    ...filters.distilleries,
    ...filters.names,
    ...filters.series,
    ...filters.companies,
    ...filters.maltTypes,
    ...filters.caskTypes,
  ];
}
