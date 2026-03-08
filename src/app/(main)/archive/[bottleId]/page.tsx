import { api } from "@/apis/apis";
import { BottleImage } from "../_components/BottleImage";

const Page = async ({ params }: { params: Promise<{ bottleId: string }> }) => {
  const { bottleId: bottleIdParam } = await params;
  const bottleId = Number(bottleIdParam);
  const bottle = await api.getBottleById(bottleId);

  return (
    <section className="ml-10">
      <div className="flex gap-10">
        <BottleImage
          src={bottle.imgUrl || "/detail-sample.png"}
          alt={bottle.name}
          containerClassName="h-[420px] w-[420px] border-[0.85px] border-white border-opacity-20"
          imageClassName="h-[400px]"
          width={300}
          height={400}
        />
        <div>
          <h2 className="typo-bold-32 text-white">{bottle.name}</h2>
          {/* 보틀 스펙 */}
          <div className="mt-10 flex gap-10">
            <div className="flex w-25 flex-col gap-5">
              {[
                "브랜드",
                "제품 종류",
                "증류소",
                "증류일",
                "병입일",
                "캐스크 종류",
                "캐스크 No.",
                "도수",
                "용량",
              ].map((item) => (
                <p key={item} className="typo-bold-20 text-white">
                  {item}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              {[
                bottle.brand || "-",
                bottle.maltType || "-",
                bottle.distillery || "-",
                bottle.distillationDate || "-",
                bottle.bottledDate || "-",
                bottle.caskType || "-",
                bottle.caskNumber || "-",
                bottle.abv || "-",
                bottle.capacity || "-",
              ].map((item, index) => (
                <p
                  key={`${item}-${index}`}
                  className="typo-medium-20 text-gray-200"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 mb-80">
        <p className="typo-medium-18 leading-loose whitespace-pre-line text-[#BCBCBC]">
          {bottle?.description || "-"}
        </p>
      </div>
    </section>
  );
};

export default Page;
