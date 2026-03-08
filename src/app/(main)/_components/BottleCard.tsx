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
      className="group cursor-pointer border-b border-white/10 pb-2 text-left transition-colors hover:bg-white/5"
    >
      <div className="relative mb-2 flex aspect-square items-center justify-center bg-linear-to-br from-gray-700 to-gray-800">
        {bottle.imgUrl ? (
          <ImageWithFallback
            src={bottle.imgUrl}
            alt={bottle.name ?? ""}
            fill
            className="object-contain p-4"
          />
        ) : (
          <div className="text-sm text-white/60 md:text-base">
            {bottle.name}
          </div>
        )}
      </div>

      <div>
        <p className="mb-0.5 text-xs text-gray-400">
          {bottle.brand ?? bottle.company ?? ""}
        </p>
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-white group-hover:text-gray-300">
          {bottle.name}
        </h3>
        <div className="flex items-center justify-between">
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
