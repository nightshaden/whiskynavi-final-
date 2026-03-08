import type { BottleParams } from "@/apis/apis";

/**
 * 필터 상태 인터페이스
 * BottleParams를 확장하여 범위 필터(abv, vintage)를 추가
 */
export interface FilterState extends BottleParams {
  abv: [number, number];
  vintage: [number, number];
}

/**
 * 필터 기본값 상수
 */
export const FILTER_DEFAULTS = {
  ABV_MIN: 40,
  ABV_MAX: 80,
  VINTAGE_MIN: 1960,
  VINTAGE_MAX: 2025,
  DEFAULT_MALT_TYPE: "single malt",
  DEBOUNCE_MS: 300,
} as const;

/**
 * 초기 필터 상태
 */
export const INITIAL_FILTER_STATE: FilterState = {
  brands: [],
  distilleries: [],
  names: [],
  series: [],
  companies: [],
  maltTypes: [FILTER_DEFAULTS.DEFAULT_MALT_TYPE],
  caskTypes: [],
  abv: [FILTER_DEFAULTS.ABV_MIN, FILTER_DEFAULTS.ABV_MAX],
  vintage: [FILTER_DEFAULTS.VINTAGE_MIN, FILTER_DEFAULTS.VINTAGE_MAX],
};
