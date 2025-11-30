/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/types/brand";
import { Button } from "../ui/button";

const commonTransition: Transition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier, easeInOut 느낌
};

// 🔹 텍스트 카드는 hover 때 나타나도록 (기본: 숨김)
const textCardVariants: Variants = {
  rest: {
    opacity: 0,
    scale: 0.95,
    y: 4,
    transition: commonTransition,
  },
  hover: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: commonTransition,
  },
};

// 🔹 이미지 카드는 기본 상태에서 보이도록 (hover 때 살짝 사라짐)
const imageCardVariants: Variants = {
  rest: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: commonTransition,
  },
  hover: {
    opacity: 0,
    scale: 1.05,
    y: -4,
    transition: commonTransition,
  },
};

const BrandItem = ({ item }: { item: Brand }) => {
  return (
    <motion.div
      key={item.name}
      className="cursor-pointer p-0 border-none bg-transparent"
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      <div className="relative w-[280px] h-[280px] rounded-[10px] overflow-hidden">
        {/* ✅ 공통 background image + blur + dark overlay */}
        <div
          className="absolute -inset-px bg-cover bg-center scale-110 blur-[11px]"
          style={{ backgroundImage: `url(${item.bgImage})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        {/* ✅ 이미지 카드 (기본 상태에서 보이는 카드) */}
        <motion.div
          variants={imageCardVariants}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={item.icon}
            alt={item.name}
            width={item.iconSize.width}
            height={item.iconSize.height}
            className="relative z-10"
          />
        </motion.div>

        {/* ✅ 텍스트 카드 (hover 시 나타나며, backdrop blur 적용) */}
        <motion.div
          variants={textCardVariants}
          className="absolute inset-0 flex flex-col items-center justify-between p-5 backdrop-blur-[11px]"
        >
          <div className="h-full flex-1 flex items-center justify-center">
            <p className="typo-regular-14 text-white text-center leading-loose line-clamp-5 flex-1">
              {item.shortDescription}
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer bg-transparent border-white text-white rounded-none mb-4"
          >
            <Link href={`/archive?brand=${item.name}`}>자세히 보기</Link>
          </Button>
        </motion.div>
      </div>

      <p className="typo-bold-20 text-center text-white mt-5">{item.name}</p>
    </motion.div>
  );
};

export default BrandItem;
