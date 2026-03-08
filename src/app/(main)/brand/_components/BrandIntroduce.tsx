"use client";

import type { BottleResponse } from "@/apis/generated/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Brand } from "@/types/brand";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DesktopCarouselCard from "./DesktopCarouselCard";
import MobileCarouselCard from "./MobileCarouselCard";
import MobileCarouselNavigation from "./MobileCarouselNavigation";

interface Props {
  brand: Brand;
  bottles: BottleResponse[];
  registerBrandRef: (id: string, el: HTMLElement | null) => void;
}

const BrandIntroduce = ({ brand, bottles, registerBrandRef }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProduct = () => {
    if (bottles.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % bottles.length);
  };

  const prevProduct = () => {
    if (bottles.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + bottles.length) % bottles.length);
  };

  const currentBottle = bottles[currentIndex];

  return (
    <section className="relative mb-12 py-16 lg:mb-20 lg:py-20">
      {/* Background with Fade */}
      <div className="absolute inset-0 right-0 left-0 mx-auto max-w-[1440px]">
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            src={brand.bgImage}
            alt={brand.name}
            className="h-full w-full object-cover"
            width={1440}
            height={480}
          />
          <div className="absolute inset-0 bg-linear-to-b from-[#1d2429] via-[#1d2429]/60 to-[#1d2429]"></div>
          <div className="absolute inset-0 bg-linear-to-r from-[#1d2429] via-transparent to-[#1d2429]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {/* Brand Title */}
        <div
          ref={(el) => {
            registerBrandRef(brand.id, el);
          }}
          className="mb-8 pt-8 text-center lg:mb-10"
          style={{ scrollMarginTop: "200px" }}
        >
          <h2 className="mb-3 text-2xl text-white sm:text-3xl lg:text-4xl">
            {brand.name}
          </h2>
          <p className="text-sm text-white/80 sm:text-base lg:text-lg">
            {brand.subname}
          </p>
        </div>

        {/* Brand Philosophy */}
        <div className="mx-auto mb-6 max-w-3xl px-4 text-center lg:mb-8">
          <p className="text-sm leading-relaxed text-white/90 sm:text-base">
            {brand.description}
          </p>
        </div>

        {/* Products Carousel */}
        {bottles.length > 0 && (
          <div className="px-6">
            <div className="mx-auto max-w-[1200px]">
              <div className="lg:hidden">
                {currentBottle && (
                  <MobileCarouselCard
                    currentBottle={currentBottle}
                    brand={brand.name}
                  />
                )}
                <MobileCarouselNavigation
                  prevProduct={prevProduct}
                  nextProduct={nextProduct}
                  bottles={bottles}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                />
              </div>

              {/* Desktop: Carousel */}
              <div className="relative hidden lg:block">
                <div
                  className="relative flex h-[480px] items-center justify-center overflow-visible"
                  style={{ perspective: "2000px" }}
                >
                  {bottles.map((bottle, bottleIndex) => (
                    <DesktopCarouselCard
                      key={`${brand.id}-bottle-${bottleIndex}`}
                      bottle={bottle}
                      bottleIndex={bottleIndex}
                      currentIndex={currentIndex}
                      totalBottles={bottles.length}
                      brandId={brand.id}
                      brandName={brand.name}
                      onSelect={setCurrentIndex}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevProduct}
                  className="absolute top-1/2 left-0 z-40 -translate-y-1/2 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextProduct}
                  className="absolute top-1/2 right-0 z-40 -translate-y-1/2 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="mt-6 flex justify-center gap-2">
                  {bottles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1 transition-all ${
                        index === currentIndex
                          ? "w-6 bg-white"
                          : "w-1 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Archive Button */}
        <div className="mt-6 text-center lg:mt-8">
          <Link
            href={`/archive?brand=${brand.id}`}
            className="border border-white px-6 py-2 text-sm text-white transition-all hover:bg-white hover:text-[#1d2429] sm:px-7 sm:py-2.5 sm:text-base"
          >
            더 많은 제품 보러가기
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandIntroduce;
