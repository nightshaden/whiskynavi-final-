import { BottleResponse } from "@/apis/generated/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  prevProduct: () => void;
  nextProduct: () => void;
  bottles: BottleResponse[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const MobileCarouselNavigation = ({
  prevProduct,
  nextProduct,
  bottles,
  currentIndex,
  setCurrentIndex,
}: Props) => {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={prevProduct}
        className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="flex gap-1.5">
        {bottles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all ${
              index === currentIndex ? "w-6 bg-white" : "w-1 bg-white/40"
            }`}
          />
        ))}
      </div>
      <button
        onClick={nextProduct}
        className="rounded-lg bg-white/10 p-2 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default MobileCarouselNavigation;
