"use client";

import { Brand } from "@/types/brand";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  brands: Brand[];
  scrollToBrand: (brandId: string) => void;
}

const BrandNavigation = ({ brands, scrollToBrand }: Props) => {
  const [navCompact, setNavCompact] = useState(false);

  useEffect(() => {
    // 스크롤 감지하여 네비게이션 컴팩트 모드 전환
    const handleScroll = () => {
      // 히어로 섹션이 거의 사라진 후에 변경 (약 300px)
      if (window.scrollY > 300) {
        setNavCompact(true);
      } else {
        setNavCompact(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky top-20 z-40 bg-[#1d2429] transition-all duration-500 ${navCompact ? "py-3 lg:py-4" : "py-6 pb-16 lg:py-4 lg:pb-8"}`}
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          {/* Desktop: 4 Tabs in Equal Grid */}
          <div
            className={`mx-auto hidden max-w-5xl transition-all duration-500 lg:grid lg:grid-cols-4 ${navCompact ? "gap-4" : "gap-6"}`}
          >
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => scrollToBrand(brand.id)}
                className={`group relative flex items-center justify-center overflow-hidden border border-white/10 bg-white/5 transition-all hover:border-white/30 hover:bg-white/10 ${navCompact ? "h-16" : "aspect-square"}`}
              >
                {navCompact ? (
                  <span className="text-base font-semibold text-white">
                    {brand.name}
                  </span>
                ) : (
                  <Image
                    src={brand.icon}
                    alt={brand.name}
                    className="max-h-[65%] max-w-[65%] object-contain transition-all group-hover:scale-105"
                    width={brand.iconSize.width}
                    height={brand.iconSize.height}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Mobile & Tablet: 2x2 Grid */}
          <div
            className={`mx-auto grid max-w-md grid-cols-2 transition-all duration-500 lg:hidden ${navCompact ? "gap-3" : "gap-4"}`}
          >
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => scrollToBrand(brand.id)}
                className={`group relative flex items-center justify-center overflow-hidden border border-white/10 bg-white/5 transition-all hover:border-white/30 hover:bg-white/10 ${navCompact ? "h-12" : "aspect-square"}`}
              >
                {navCompact ? (
                  <span className="text-sm font-semibold text-white">
                    {brand.name}
                  </span>
                ) : (
                  <Image
                    src={brand.icon}
                    alt={brand.name}
                    className="max-h-[60%] max-w-[60%] object-contain transition-all group-hover:scale-105"
                    width={brand.iconSize.width}
                    height={brand.iconSize.height}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`flex cursor-pointer flex-col items-center justify-center pb-4 transition-opacity duration-500 md:pb-10 lg:pb-12 ${navCompact ? "h-0 overflow-hidden opacity-0" : "opacity-100"}`}
        onClick={() => scrollToBrand("whiskynavi")}
      >
        <ChevronDown
          className="animate-scroll-down h-6 w-6 text-white/40 md:h-10 md:w-10 lg:h-12 lg:w-12"
          strokeWidth={1.5}
        />
      </div>
    </>
  );
};

export default BrandNavigation;
