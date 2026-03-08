import { BottleResponse } from "@/apis/generated/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";

interface Props {
  currentBottle: BottleResponse;
  brand: string;
}

const MobileCarouselCard = ({ currentBottle, brand }: Props) => {
  return (
    <div className="mb-4 rounded-lg border border-white/10 bg-white/4 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded">
          <ImageWithFallback
            src={currentBottle.imgUrl ?? "/default-bottle-v2.png"}
            alt={currentBottle.name ?? ""}
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="mb-1.5 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            {brand}
          </span>
          <h4 className="mb-1 text-sm text-white">{currentBottle.name}</h4>
          <p className="text-xs text-white/60">{currentBottle.description}</p>
        </div>
      </div>
    </div>
  );
};

export default MobileCarouselCard;
