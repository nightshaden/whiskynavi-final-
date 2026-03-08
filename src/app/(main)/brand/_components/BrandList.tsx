"use client";

import type { Brand } from "@/types/brand";
import type { BottleResponse } from "@/apis/generated/api";
import BrandIntroduce from "./BrandIntroduce";

interface Props {
  brands: Brand[];
  bottlesMap: Record<string, BottleResponse[]>;
  registerBrandRef: (id: string, el: HTMLElement | null) => void;
}

const BrandList = ({ brands, bottlesMap, registerBrandRef }: Props) => {
  return (
    <>
      {brands.map((brand) => (
        <BrandIntroduce
          key={brand.id}
          brand={brand}
          bottles={bottlesMap[brand.id] ?? []}
          registerBrandRef={registerBrandRef}
        />
      ))}
    </>
  );
};

export default BrandList;
