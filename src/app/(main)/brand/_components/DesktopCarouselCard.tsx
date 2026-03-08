import type { BottleResponse } from "@/apis/generated/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { getProductPosition } from "../_utils";

interface Props {
  bottle: BottleResponse;
  bottleIndex: number;
  currentIndex: number;
  totalBottles: number;
  brandId: string;
  brandName: string;
  onSelect: (index: number) => void;
}

const DesktopCarouselCard = ({
  bottle,
  bottleIndex,
  currentIndex,
  totalBottles,
  brandId,
  brandName,
  onSelect,
}: Props) => {
  const position = getProductPosition(currentIndex, bottleIndex, totalBottles);

  if (!position) return null;

  const isCenter = bottleIndex === currentIndex;
  const baseWidth = 240;
  const cardWidth = baseWidth * position.scale;
  const cardHeight = cardWidth * 1.25;

  return (
    <div
      key={`${brandId}-bottle-${bottleIndex}`}
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
          <ImageWithFallback
            src={bottle.imgUrl ?? "/default-bottle-v2.png"}
            alt={bottle.name ?? ""}
            width={Math.round(cardWidth - (isCenter ? 40 : position.scale === 0.85 ? 32 : 24))}
            height={Math.round((cardWidth - (isCenter ? 40 : position.scale === 0.85 ? 32 : 24)) * 1.2)}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="shrink-0">
          <span className="mb-2 inline-block bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            {brandName}
          </span>
          <h4
            className={`mb-2 text-white ${isCenter ? "text-base" : "text-sm"}`}
          >
            {bottle.name}
          </h4>
          <p
            className={`text-white/70 ${isCenter ? "text-sm" : "text-xs"}`}
          >
            {bottle.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesktopCarouselCard;
