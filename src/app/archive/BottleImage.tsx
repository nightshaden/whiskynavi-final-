"use client";

import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type BottleImageProps = {
  src: string;
  alt: string;
  containerClassName?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
};

export function BottleImage({
  src,
  alt,
  containerClassName,
  imageClassName,
  width = 180,
  height = 240,
}: BottleImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden relative",
        containerClassName,
      )}
    >
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-auto object-contain transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          imageClassName,
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
