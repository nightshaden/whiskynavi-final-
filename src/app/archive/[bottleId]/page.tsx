import Image from "next/image";
import { api } from "@/apis/apis";

// const SAMPLE = {
//   id: 1,
//   name: "위스키내비 5th Anniversary",
//   company: "위스키내비",
//   brand: "위스키내비",
//   series: null,
//   imgUrl: "/detail-sample.png",
//   extraInfos: {},
//   maltType: "Single Malt",
//   distillery: "glenburgie",
//   distillationDate: "1995-06-20",
//   bottledDate: "2025-07-24",
//   caskType: "Bourbon Hogshead",
//   caskNumber: "#6695",
//   abv: 53.8,
//   capacity: 700,
//   description: `[노징(Nosing)]
// 잔에 따르면 포도즙과 카라멜라이징된 설탕의 진한 단내가 코를 지배하며 시작된다. 이후 약간 탄화된 쌉싸래한 뉘앙스와 묽은 과실향이 어우러지며, 복숭아·포도·자두로 이어지는 복합적인 향의 흐름이 피클국물 같은 숙성 시트러스로 종결된다. 향 전체에 철분감 있는 미네랄리티와 암염의 날카로운 솔티함이 조미료처럼 얹혀져 있으며, 그 위에 은은하게 깔린 꿀의 달콤함이 전체 향을 안정시키되, 미네랄리티는 끝까지 자리를 지킨다.

// [팔렛(Palate)]
// 입에 닿자마자 달고나와 과실에서 비롯된 달큼함이 가볍게 퍼지며 시작되나, 이후 우디함과 보리껍질 특유의 씁쓸함이 더해져 단조롭지 않게 전개된다. 티처럼 부드러운 액질은 입안에서 유연하게 굴러다니며 침과 섞이면서 점차 무게감을 갖되 무겁지 않은 수준에서 머무른다. 꿀과 같은 녹진한 단맛이 중심을 이루며, 새큼함이 살짝 터지긴 해도 전반적인 구조는 진득한 단맛이 주도하고 있다. 비강으로는 강하지 않지만 은은한 우마미와 매캐한 달콤함이 받쳐주며, 이 감칠맛은 설탕에서 꿀, 나아가 감초처럼 복합적인 뉘앙스로 진화해 입안에 오래 머문다.

// [피니쉬(Finish)]
// 피니시는 하이랜드파크 특유의 허니스모크를 중심으로 은은한 스모키함에 꿀의 달큰함이 더해진 전형적인 하팍 스타일로 전개된다. 브래스에서 느껴졌던 당분감과 훈연의 스모크는 입 전반에 코팅되듯 남아있으며, 여기에 오렌지필 특유의 쌉싸래한 시트러스 뉘앙스가 더해져 향미에 입체감을 부여한다. 입맛을 다실 때는 은은한 쌉쌀함과 염분감이 느껴져 미네랄리티의 여운이 끝까지 이어지며, 전반적으로 무게감 있는 풍미임에도 불구하고 자극적이지 않고 부드럽게 다가와 자연스럽게 다음 잔을 부르게 만드는 매력을 지닌 피니시다.

// [총평]
// 이 한 잔의 끝에서 하이랜드파크에서 추구하는 이데아의 편린을 보았다.`,
//   createdAt: null,
//   updatedAt: null,
// };

const Page = async ({ params }: { params: Promise<{ bottleId: string }> }) => {
  const { bottleId: bottleIdParam } = await params;
  const bottleId = Number(bottleIdParam);
  const bottle = await api.getBottleById(bottleId);

  return (
    <section className="ml-10">
      <div className="flex gap-10">
        <div className="flex justify-center items-center h-[420px] w-[420px] border-[0.85px] border-white border-opacity-20">
          <Image
            src={bottle.imgUrl || "/detail-sample.png"}
            alt={bottle.name}
            width={300}
            height={400}
            className="h-[400px] w-auto object-contain"
          />
        </div>
        <div>
          <h2 className="typo-bold-32 text-white">{bottle.name}</h2>
          {/* 보틀 스펙 */}
          <div className="flex gap-10 mt-10">
            <div className="flex flex-col gap-5 w-25">
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
                <p key={item} className="text-white typo-bold-20">
                  {item}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              {[
                bottle.brand,
                bottle.maltType,
                bottle.distillery,
                bottle.distillationDate,
                bottle.bottledDate,
                bottle.caskType,
                bottle.caskNumber,
                bottle.abv,
                bottle.capacity,
              ].map((item) => (
                <p key={item} className="text-gray-200 typo-medium-20">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 mb-80 ">
        <p className="text-[#BCBCBC] typo-medium-18 whitespace-pre-line leading-loose">
          {bottle.description}
        </p>
      </div>
    </section>
  );
};

export default Page;
