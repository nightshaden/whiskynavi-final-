import { BottleResponse } from "@/apis/generated/api";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";

interface Props {
  bottle: BottleResponse;
}
const BottleCard = ({ bottle }: Props) => {
  return (
    <Link
      key={bottle.id}
      href={`/archive/${bottle.id}`}
      className="group cursor-pointer border border-white/10 p-2.5 pb-1.5 text-left transition-colors hover:bg-white/5 sm:p-4 sm:pb-2"
    >
      <div className="relative mb-2 flex aspect-square items-center justify-center">
        {bottle.imgUrl ? (
          <ImageWithFallback
            src={bottle.imgUrl}
            alt={bottle.name ?? ""}
            fill
            className="object-contain p-1.5 sm:p-4"
          />
        ) : (
          <div className="text-sm text-white/60 md:text-base">
            {bottle.name}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {bottle.brand ?? bottle.company ?? ""}
        </p>
        <h3
          className="typo-medium-14 mt-2 line-clamp-2 text-white group-hover:text-gray-300"
          style={{ lineHeight: 1.4 }}
        >
          {bottle.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {bottle.distillery ?? ""}
          </span>
          {bottle.abv != null && (
            <span className="text-xs text-gray-400">{bottle.abv}%</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BottleCard;
