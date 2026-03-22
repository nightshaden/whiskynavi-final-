import { getApiBottlesId } from "@/apis/generated/api";
import { ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";

const Page = async ({ params }: { params: Promise<{ bottleId: string }> }) => {
  const { bottleId: bottleIdParam } = await params;
  const bottleId = Number(bottleIdParam);
  const { data: bottle } = await getApiBottlesId(bottleId);

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-10 lg:py-12">
        {/* Back Button */}
        <Link
          href="/archive"
          className="mb-3 mt-4 flex items-center gap-2 text-white/70 transition-colors hover:text-white lg:mb-8 lg:mt-0"
        >
          <ArrowLeft size={18} className="lg:hidden" />
          <ArrowLeft size={20} className="hidden lg:block" />
          <span className="typo-bold-14 lg:text-base">
            목록으로 돌아가기
          </span>
        </Link>

        {/* Main Content - 3 Column Grid */}
        <div className="border border-white/10 bg-white/5 p-4 lg:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Column 1 - Image */}
            <div>
              <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                {bottle.imgUrl ? (
                  <ImageWithFallback
                    src={bottle.imgUrl}
                    alt={bottle.name ?? ""}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="text-4xl text-white/60 lg:text-5xl">
                    {bottle.name}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2 - Basic Info */}
            <div className="flex flex-col">
              <h3 className="typo-bold-20 lg:text-2xl mb-6 text-white lg:mb-8">
                {bottle.name}
              </h3>

              <div className="space-y-3 lg:space-y-4">
                {[
                  { label: "브랜드", value: bottle.brand },
                  { label: "증류소", value: bottle.distillery },
                  { label: "몰트 타입", value: bottle.maltType },
                  { label: "도수", value: bottle.abv != null ? `${bottle.abv}%` : undefined },
                  { label: "캐스크", value: bottle.caskType },
                  { label: "캐스크 No.", value: bottle.caskNumber },
                  { label: "증류일", value: bottle.distillationDate },
                  { label: "병입일", value: bottle.bottledDate },
                  { label: "용량", value: bottle.capacity != null ? `${bottle.capacity}ml` : undefined },
                ].map((item, index, arr) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between pb-2 lg:pb-3 ${
                      index < arr.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <span className="text-sm text-gray-400 lg:text-base">
                      {item.label}
                    </span>
                    <span className="typo-medium-14 lg:text-base text-white">
                      {item.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 - Tasting Note */}
            <div className="flex flex-col">
              <h3 className="typo-bold-18 lg:text-xl mb-4 text-white">
                테이스팅 노트
              </h3>
              <div className="max-h-[400px] overflow-y-auto border border-white/10 p-4 lg:max-h-[500px] lg:p-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300 lg:text-base">
                  {bottle.description || "테이스팅 노트가 제공되지 않았습니다."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
