import type { BottleResponse } from "@/apis/generated/api";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import type { Carousel3DPosition } from "@/components/ui/carousel-3d";
import { memo } from "react";

interface Props {
  bottle: BottleResponse;
  bottleIndex: number;
  position: Carousel3DPosition;
  isCenter: boolean;
  brandName: string;
  onSelect: (index: number) => void;
}

const CarouselBottleCard = memo(function CarouselBottleCard({
  bottle,
  bottleIndex,
  position,
  isCenter,
  brandName,
  onSelect,
}: Props) {
  const baseWidth = 240;
  const cardWidth = baseWidth * position.scale;
  const cardHeight = cardWidth * 1.25;

  return (
    <div
      className={`absolute transition-all duration-700 ease-in-out ${!isCenter ? "cursor-pointer" : ""}`}
      style={{
        transform: `
          translateX(${position.x}px)
          translateY(${position.y}px)
          translateZ(${position.z}px)
          rotateY(${position.rotateY}deg)
        `,
        opacity: position.opacity,
        transformStyle: "preserve-3d",
        zIndex: position.zIndex,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        filter: `brightness(${position.brightness})`,
      }}
      onClick={() => {
        if (!isCenter) {
          onSelect(bottleIndex);
        }
      }}
    >
      <div
        className={`${isCenter ? "border-white/30 bg-[#2a3137]" : "border-white/10 bg-[#232a2f]"} flex h-full flex-col border shadow-2xl ${isCenter ? "p-5" : position.scale === 0.85 ? "p-4" : "p-3"} ${!isCenter ? "transition-colors hover:border-white/30" : ""}`}
      >
        <div className="mb-3 flex w-full flex-1 items-center justify-center overflow-hidden">
          {isCenter && bottle.imgUrl ? (
            <ImageLightbox src={bottle.imgUrl} alt={bottle.name ?? ""}>
              <ImageWithFallback
                src={bottle.imgUrl}
                alt={bottle.name ?? ""}
                width={Math.round(cardWidth - 40)}
                height={Math.round((cardWidth - 40) * 1.2)}
                className="h-full w-full object-contain"
              />
            </ImageLightbox>
          ) : (
            <ImageWithFallback
              src={bottle.imgUrl ?? "/default-bottle-v2.png"}
              alt={bottle.name ?? ""}
              width={Math.round(cardWidth - (isCenter ? 40 : position.scale === 0.85 ? 32 : 24))}
              height={Math.round((cardWidth - (isCenter ? 40 : position.scale === 0.85 ? 32 : 24)) * 1.2)}
              className="h-full w-full object-contain"
            />
          )}
        </div>
        <div className="shrink-0">
          <span className="mb-2 inline-block bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{brandName}</span>
          <h4 className={`mb-2 line-clamp-2 break-all text-white ${isCenter ? "text-base" : "text-sm"}`}>
            {bottle.name}
          </h4>
        </div>
      </div>
    </div>
  );
});

export default CarouselBottleCard;
