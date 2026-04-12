"use client";

import type { BottleResponse } from "@/apis/generated/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Brand } from "@/types/brand";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import DesktopCarouselCard from "./DesktopCarouselCard";

const BrandBackground = memo(function BrandBackground({
  bgImage,
  name,
}: {
  bgImage: string;
  name: string;
}) {
  return (
    <div className="absolute inset-0 right-0 left-0 mx-auto max-w-[1440px]">
      <div className="absolute inset-0 overflow-hidden">
        <ImageWithFallback
          src={bgImage}
          alt={name}
          className="h-full w-full object-cover"
          width={1440}
          height={480}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#1d2429] via-[#1d2429]/60 to-[#1d2429]"></div>
        <div className="absolute inset-0 bg-linear-to-r from-[#1d2429] via-transparent to-[#1d2429]"></div>
      </div>
    </div>
  );
});

interface Props {
  brand: Brand;
  bottles: BottleResponse[];
  registerBrandRef: (id: string, el: HTMLElement | null) => void;
}

const ANIMATION_DURATION = 400;
const SWIPE_THRESHOLD = 50;
const DRAG_THRESHOLD = 10;

const BrandIntroduce = ({ brand, bottles, registerBrandRef }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef(0);
  const touchMoveDistRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const throttledSetIndex = useCallback((getNext: (prev: number) => number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setCurrentIndex(getNext);
    timerRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
    }, ANIMATION_DURATION);
  }, []);

  const nextProduct = () => {
    if (bottles.length === 0) return;
    throttledSetIndex((prev) => (prev + 1) % bottles.length);
  };

  const prevProduct = () => {
    if (bottles.length === 0) return;
    throttledSetIndex((prev) => (prev - 1 + bottles.length) % bottles.length);
  };

  const goToIndex = useCallback(
    (index: number) => {
      throttledSetIndex((prev) => (prev === index ? prev : index));
    },
    [throttledSetIndex],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    touchMoveDistRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchMoveDistRef.current = Math.abs(
      touchStartRef.current - e.touches[0].clientX,
    );
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    const diff = touchStartRef.current - touch.clientX;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    if (diff > 0) {
      nextProduct();
    } else {
      prevProduct();
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = 0;
    touchMoveDistRef.current = 0;
  };

  const handleCardSelect = useCallback(
    (index: number) => {
      if (touchMoveDistRef.current >= DRAG_THRESHOLD) return;
      goToIndex(index);
    },
    [goToIndex],
  );

  return (
    <section className="relative mb-12 py-16 lg:mb-20 lg:py-20">
      <BrandBackground bgImage={brand.bgImage} name={brand.name} />

      {/* Content */}
      <div className="relative">
        {/* Brand Title */}
        <div
          ref={(el) => {
            registerBrandRef(brand.id, el);
          }}
          className="mb-8 scroll-mt-[200px] pt-8 text-center lg:mb-10"
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
          <div className="overflow-x-clip px-6">
            <div className="mx-auto max-w-[1200px]">
              <div className="relative">
                <div
                  className="relative flex h-[480px] items-center justify-center overflow-visible [perspective:2000px]"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
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
                      onSelect={handleCardSelect}
                    />
                  ))}
                </div>

                {/* Navigation Buttons - Desktop only */}
                <button
                  onClick={prevProduct}
                  aria-label="이전 제품"
                  className="absolute top-1/2 left-0 z-40 hidden -translate-y-1/2 cursor-pointer bg-white/10 p-3 text-white transition-colors hover:bg-white/20 lg:block"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextProduct}
                  aria-label="다음 제품"
                  className="absolute top-1/2 right-0 z-40 hidden -translate-y-1/2 cursor-pointer bg-white/10 p-3 text-white transition-colors hover:bg-white/20 lg:block"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicators */}
                <div className="mt-6 flex justify-center gap-2">
                  {bottles.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)}
                      aria-label={`${index + 1}번 제품으로 이동`}
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
