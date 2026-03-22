"use client";

import type { BottleResponse } from "@/apis/generated/api";
import type { Brand } from "@/types/brand";
import { useCallback, useRef } from "react";
import { BrandRefs } from "../_types";
import BrandList from "./BrandList";
import BrandNavigation from "./BrandNavigation";

interface Props {
  brands: Brand[];
  bottlesMap: Record<string, BottleResponse[]>;
}

const BrandContent = ({ brands, bottlesMap }: Props) => {
  const brandRefs = useRef<BrandRefs>({
    위스키내비: null,
    위스키테일즈: null,
    "트레일&테일": null,
    투게더인스피릿: null,
  });

  const registerBrandRef = useCallback((id: string, el: HTMLElement | null) => {
    brandRefs.current[id] = el;
  }, []);

  const scrollToBrand = useCallback((brandId: string) => {
    const element = brandRefs.current[brandId];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <>
      <BrandNavigation brands={brands} scrollToBrand={scrollToBrand} />
      <BrandList
        brands={brands}
        bottlesMap={bottlesMap}
        registerBrandRef={registerBrandRef}
      />
    </>
  );
};

export default BrandContent;
