"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { LineupItem } from "@/types/brand";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LineupCarousel({ slides }: { slides: LineupItem[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // current 인덱스로부터의 거리 계산 (loop 감안)
  const getDistance = (idx: number, current: number, total: number) => {
    const diff = Math.abs(idx - current);
    return Math.min(diff, total - diff);
  };

  // 거리에 따른 이미지 크기 반환
  const getImageSize = (distance: number) => {
    if (distance === 0) return { width: 350, height: 420 }; // current
    if (distance === 1) return { width: 300, height: 360 }; // 1칸 차이
    return { width: 250, height: 300 }; // 2칸 이상 차이
  };

  // 가로 위치 계산 (160px씩 겹치기)
  const getHorizontalPosition = (
    idx: number,
    current: number,
    total: number,
  ) => {
    let offset = idx - current;

    // loop를 고려한 최단 거리 계산
    if (offset > total / 2) {
      offset = offset - total;
    } else if (offset < -total / 2) {
      offset = offset + total;
    }

    return offset * 160; // 각 카드가 160px씩 떨어짐
  };

  // Z-index 계산
  const getZIndex = (distance: number) => {
    if (distance === 0) return 30; // current (최상단)
    if (distance === 1) return 20; // 중간
    return 10; // 최하단
  };

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        loop: true,
        watchDrag: false,
      }}
      className="relative w-full"
    >
      <div className="absolute top-5 left-1/2 z-40 flex -translate-x-1/2 gap-5">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`cursor-pointer rounded-full transition-all duration-300 ${
              current === index
                ? "h-2.5 w-6.25 bg-white"
                : "h-2.5 w-2.5 bg-[#D9D9D9]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      <div
        className={`relative w-full ${slides[0].size === "short" ? "h-[540px]" : "h-[580px]"} flex items-center justify-center`}
      >
        {/* 모든 이미지를 한 번에 렌더링 */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {slides.map((item, imgIdx) => {
            const distance = getDistance(imgIdx, current, slides.length);
            const size = getImageSize(distance);
            const xPosition = getHorizontalPosition(
              imgIdx,
              current,
              slides.length,
            );
            const zIndex = getZIndex(distance);

            return (
              <div
                key={item.id}
                className="flex flex-col items-center justify-center"
              >
                <motion.div
                  className={`absolute select-none ${
                    distance === 0
                      ? "pointer-events-none"
                      : "pointer-events-auto cursor-pointer"
                  }`}
                  onClick={() => {
                    if (distance > 0) {
                      api?.scrollTo(imgIdx);
                    }
                  }}
                  animate={{
                    x: xPosition,
                    scale: distance === 0 ? 1 : distance === 1 ? 0.95 : 0.9,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.5,
                  }}
                  style={{
                    zIndex: zIndex,
                  }}
                >
                  <div className="relative">
                    <Image
                      src={item.image}
                      alt={item.caption}
                      width={size.width}
                      height={size.height}
                      className="rounded-[10px]"
                      draggable={false}
                    />
                    {/* 거리 1일 때 오버레이 */}
                    {distance === 1 && (
                      <motion.div
                        className="pointer-events-none absolute inset-0 rounded-[10px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          border: "1px solid rgba(255, 255, 255, 0.20)",
                          background: "rgba(46, 54, 60, 0.70)",
                          backdropFilter: "blur(11px)",
                        }}
                      />
                    )}
                    {/* 거리 2 이상일 때 오버레이 */}
                    {distance >= 2 && (
                      <motion.div
                        className="pointer-events-none absolute inset-0 rounded-[10px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          border: "1px solid rgba(255, 255, 255, 0.20)",
                          background: "rgba(46, 54, 60, 0.90)",
                          backdropFilter: "blur(11px)",
                        }}
                      />
                    )}
                  </div>
                </motion.div>
                {imgIdx === current && (
                  <div
                    className={`pointer-events-auto absolute right-0 bottom-[-100px] left-0 p-10`}
                  >
                    <p className="typo-bold-24 mt-6">{item.caption}</p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="mt-7 cursor-pointer rounded-none border-white bg-transparent text-white"
                    >
                      <Link href={`/archive?brand=${item.id}`}>
                        자세히 보기
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Carousel API를 위한 숨겨진 슬라이드 (드래그 비활성화) */}
        <CarouselContent className="pointer-events-none invisible absolute">
          {slides.map((item) => (
            <CarouselItem key={item.id} className="basis-full">
              <div />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  );
}
