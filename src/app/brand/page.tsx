import Image from "next/image";
import BrandItem from "@/components/brand/BrandItem";
import LineupCarousel from "@/components/brand/LineupCarousel";
import type { Brand, LineupItem } from "@/types/brand";

const NAVI_SLIDES: LineupItem[] = [
  {
    id: "zodiac-signs",
    image: "/lineup/navi/zodiac-signs.png",
    caption: "십이지신도",
    size: "short",
  },
  {
    id: "korean-seasonal-events",
    image: "/lineup/navi/korean-seasonal-events.png",
    caption: "한국의 세시",
    size: "short",
  },
  {
    id: "community-release",
    image: "/lineup/navi/community-release.png",
    caption: "커뮤니티 릴리즈",
    size: "short",
  },
  {
    id: "ink-painting",
    image: "/lineup/navi/ink-painting.png",
    caption: "수묵화",
    size: "short",
  },
  {
    id: "illustration",
    image: "/lineup/navi/illustration.png",
    caption: "일러스트레이션",
    size: "short",
  },
];

const TAILS_SLIDES: LineupItem[] = [
  {
    id: "retro",
    image: "/lineup/tails/retro.png",
    caption: "레트로",
    size: "short",
  },
  {
    id: "blended-malt",
    image: "/lineup/tails/blended-malt.png",
    caption: "블렌디드몰트",
    size: "short",
  },
  {
    id: "official",
    image: "/lineup/tails/official.png",
    caption: "시즌 정규",
    size: "short",
  },
  {
    id: "malt-the-rock",
    image: "/lineup/tails/malt-the-rock.png",
    caption: "몰트더락",
    size: "short",
  },
  {
    id: "seasonal",
    image: "/lineup/tails/seasonal.png",
    caption: "시즈널",
    size: "short",
  },
];

const TRAIL_AND_TAIL_SLIDES: LineupItem[] = [
  {
    id: "bunnahabhain",
    image: "/lineup/trail/bunnahabhain.png",
    caption: "#5 Bunnahabhain",
    size: "long",
  },
  {
    id: "benriach",
    image: "/lineup/trail/benriach.png",
    caption: "#1 Benriach",
    size: "long",
  },
  {
    id: "secret-distillery",
    image: "/lineup/trail/secret-distillery.png",
    caption: "#2 Secret Distillery",
    size: "long",
  },
  {
    id: "croftengea",
    image: "/lineup/trail/croftengea.png",
    caption: "#3 Croftengea",
    size: "long",
  },
  {
    id: "elgin",
    image: "/lineup/trail/elgin.png",
    caption: "#4 Glen Elgin",
    size: "long",
  },
];

const TOGETHER_IN_SPIRIT_SLIDES: LineupItem[] = [
  {
    id: "navi-together",
    image: "/lineup/together/navi-together.png",
    caption: "2025 경북 산불 피해 지원 (WHISKYNAVI)",
    size: "long",
  },
  {
    id: "tails-together",
    image: "/lineup/together/tails-together.png",
    caption: "2025 경북 산불 피해 지원 (THE WHISKYTALES)",
    size: "long",
  },
];

const NAVI = {
  bgImage: "/brands/brand-bg-whiskynavi.png",
  icon: "/brands/icon-whisky-navi.png",
  iconSize: { width: 120, height: 151 },
  name: "위스키내비",
  subname: "대한민국 독립병입 시장의 선두주자",
  description: `당사의 대표 브랜드로, 가장 세분화된 제품 라인업을 자랑합니다. 엄선된 고품질 큐레이션을 통한 \n 맞춤형 제품 개발, 도전적인 보틀링, 그리고 감성적 디자인으로 국내 독립병입 시장을 선도하고 있습니다.`,
  shortDescription: `당사의 대표 브랜드로, 가장 세분화된 제품 라인업을 자랑합니다. 엄선된 고품질 큐레이션을 통한 맞춤형 제품 개발, 도전적인 보틀링, 그리고 감성적 디자인으로 국내 독립병입 시장을 선도하고 있습니다.`,
  slides: NAVI_SLIDES,
};

const TAILS = {
  bgImage: "/brands/brand-bg-the-whisky-tails.png",
  icon: "/brands/icon-the-whisky-tails.png",
  iconSize: { width: 181, height: 110 },
  name: "더 위스키테일즈",
  subname: "스토리와 테마가 있는 서브컬처 라벨 위스키",
  description: `독립병입의 특성을 살려 라벨의 자유도를 극대화하고, 서브컬처 문화의 감성과 취향이 반영된 독창적인 스토리와 테마를 담아냅니다. \n 서브컬처를 사랑하는 이들이 위스키의 세계로 자연스럽게 발걸음을 옮길 수 있게 돕는 것, 그것이 바로 더 위스키테일즈의 목표입니다.`,
  shortDescription: `독립병입의 특성을 살려 라벨의 자유도를 \n 극대화하고, 서브컬처 문화의 감성과 취향이 \n 반영된 독창적인 스토리와 테마를 담아냅니다.`,
  slides: TAILS_SLIDES,
};

const TRAIL_AND_TAIL = {
  bgImage: "/brands/brand-bg-trail-and-tail.png",
  icon: "/brands/icon-trail-and-tail.png",
  iconSize: { width: 186, height: 130 },
  name: "트레일앤테일",
  subname: "자신만의 취향과 세계는 간직되어야 하기에",
  description: `서브컬처와 위스키를 모두 사랑하지만, 상황에 따라 신중하게 취향을 드러내야 하는 고객층을 위해 기획된 브랜드입니다. \n 단순한 '위스키'를 넘어, 취향의 흔적을 따라가는 여정(Trail)과 그 안에 담긴 이야기(Tale)를 함께 담아냅니다. \n 더 위스키테일즈보다 한층 더 품질에 집중하며, 가격대 또한 소폭 상향된 프리미엄 라인으로 구성되어 있습니다. \n 숙성과 블렌딩, 병입 과정에서 세심하게 선택된 위스키만을 엄선하여, 감성과 기술이 공존하는 한 잔을 선사합니다.`,
  shortDescription: `신중하게 취향을 드러내야 하는 \n 고객층을 위해 기획된 브랜드입니다. \n 취향의 흔적을 따라가는 여정(Trail)과 \n그 안에 담긴 이야기(Tale)를 함께 담아냅니다.`,
  slides: TRAIL_AND_TAIL_SLIDES,
};

const TOGETHER_IN_SPIRIT = {
  bgImage: "/brands/brand-bg-together-in-spirit.png",
  icon: "/brands/icon-together-in-spirit.png",
  iconSize: { width: 205, height: 110 },
  name: "투게더 인 스피릿",
  subname: "위스키로 함께하는 사회적 가치 창출",
  description: `위스키내비의 ESG 프로젝트로, 해외 위스키 시장의 자선 보틀 문화를 한국에 도입했습니다. \n 주기적으로 사회적인 이슈를 선별하여 위스키 애호가들과 함께 기부 캠페인을 진행하고, \n 이를 기념하는 한정 보틀을 제작하여 의미 있는 가치를 공유합니다.`,
  shortDescription: `위스키내비의 ESG 프로젝트로, \n 뜻깊은 의미가 담긴 자선 보틀을 통해 \n위스키 그 이상의 가치를 공유합니다.`,
  slides: TOGETHER_IN_SPIRIT_SLIDES,
};

const BRANDS: Brand[] = [NAVI, TAILS, TRAIL_AND_TAIL, TOGETHER_IN_SPIRIT];

const Page = () => {
  return (
    <main>
      <section className="mt-50 w-full max-w-screen-lg mx-auto">
        <h1 className="typo-bold-40 text-center text-white">브랜드</h1>

        <div className="flex gap-7 mx-auto justify-center mt-11">
          {BRANDS.map((item) => (
            <BrandItem key={item.name} item={item} />
          ))}
        </div>
      </section>
      {BRANDS.map((brand) => (
        <section
          key={brand.name}
          className="relative w-full mt-70 mx-auto bg-[#1d2329] overflow-hidden"
        >
          <div
            className="
              absolute inset-0
              bg-cover bg-center
              pointer-events-none
              after:absolute after:inset-0 after:content-['']
              after:bg-linear-to-b
              after:from-[#1d2329] 
              after:via-[#1d2329]/20
              after:to-[#1d2329]
    "
            style={{ backgroundImage: `url(${brand.bgImage})` }}
          />

          <div className="relative py-52 z-10 flex flex-col items-center justify-center text-center text-white">
            <div className="flex flex-col items-center justify-center">
              <h2 className="typo-bold-40">{brand.name}</h2>
              <Image
                src={brand.icon}
                alt={brand.name}
                width={brand.iconSize.width}
                height={brand.iconSize.height}
                className="mt-[22px]"
              />
              <p className="mt-7 typo-bold-20">{brand.subname}</p>
              <p className="mt-5 leading-loose typo-medium-18 whitespace-pre-line">
                {brand.description}
              </p>
            </div>
            <h2 className="mt-9 typo-bold-30">LINE UP</h2>
            <LineupCarousel slides={brand.slides} />
          </div>
        </section>
      ))}
      <div className="h-[114px]" />
    </main>
  );
};

export default Page;
