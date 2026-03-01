"use client";
import { ImageWithFallback } from "@/components/ui/ImageWIthFallback";
import { ArrowRight, ChevronDown, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

const heroSlides = [
  {
    image: "/bg-sample.png",
    title: "더 위스키테일즈 : 여름 바캉스",
    subtitle: "링크우드 증류소의 달큼한 청사과 뉘앙스",
  },
  {
    image: "/bg-sample.png",
    title: "투게더 인 스피릿",
    subtitle: "위스키 애호가들과 함께하는 새로운 여정",
  },
  {
    image: "/bg-sample.png",
    title: "스코틀랜드 증류소 방문기",
    subtitle: "마스터 디스틸러와 함께한 캐스크 선정의 순간",
  },
];

const recentProducts = [
  {
    name: "Glenfiddich 1993",
    brand: "위스키내비",
    distillery: "글렌피딕",
    abv: 56.3,
    vintage: 1993,
    image:
      "https://images.unsplash.com/photo-1675239612197-7d2e962c79ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlza3klMjBib3R0bGUlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY5NTY3NzE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Lagavulin 2005",
    brand: "더 위스키테일즈",
    distillery: "라가불린",
    abv: 58.7,
    vintage: 2005,
    image:
      "https://images.unsplash.com/photo-1767536196118-9f0592594dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY290Y2glMjB3aGlza3klMjBib3R0bGUlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3Njk1Njc3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Glenmorangie 1998",
    brand: "트레일 앤 테일",
    distillery: "글렌모렌지",
    abv: 54.2,
    vintage: 1998,
    image:
      "https://images.unsplash.com/photo-1543512214-7f42e72800aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nbGUlMjBtYWx0JTIwd2hpc2t5JTIwYm90dGxlfGVufDF8fHx8MTc2OTU2NzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Bowmore 2002",
    brand: "투게더 인 스피릿",
    distillery: "보모어",
    abv: 55.8,
    vintage: 2002,
    image:
      "https://images.unsplash.com/photo-1746422029293-43065303dab5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwd2hpc2t5JTIwYm90dGxlcyUyMGNvbGxlY3Rpb258ZW58MXx8fHwxNzY5NTY3NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Ardbeg 2008",
    brand: "위스키내비",
    distillery: "아드벡",
    abv: 59.1,
    vintage: 2008,
    image:
      "https://images.unsplash.com/photo-1759673953885-ed55f5d382de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlza3klMjBib3R0bGUlMjBsYWJlbCUyMGNsb3NldXB8ZW58MXx8fHwxNzY5NTY3NzE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Talisker 2000",
    brand: "더 위스키테일즈",
    distillery: "탈리스커",
    abv: 57.4,
    vintage: 2000,
    image:
      "https://images.unsplash.com/photo-1675239612197-7d2e962c79ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlza3klMjBib3R0bGUlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNjkzNTY3NzE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Highland Park 1999",
    brand: "트레일 앤 테일",
    distillery: "하이랜드 파크",
    abv: 56.9,
    vintage: 1999,
    image:
      "https://images.unsplash.com/photo-1767536196118-9f0592594dcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY290Y2glMjB3aGlza3klMjBib3R0bGUlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3Njk1Njc3MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Caol Ila 2010",
    brand: "투게더 인 스피릿",
    distillery: "카올 일라",
    abv: 58.2,
    vintage: 2010,
    image:
      "https://images.unsplash.com/photo-1543512214-7f42e72800aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW5nbGUlMjBtYWx0JTIwd2hpc2t5JTIwYm90dGxlfGVufDF8fHx8MTc2OTU2NzcxN3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 페이지 로드 애니메이션
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // 슬라이드 자동 전환
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(timer);
    };
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-[#1d2429]">
      {/* Hero Section - 모바일에서는 높이 축소, 데스크톱에서만 전체 화면 */}
      <section className="relative h-[calc(100vh-80px)] overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-1000 ease-out ${isLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
        >
          <ImageWithFallback
            src={heroSlides[currentSlide].image}
            alt={heroSlides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div
          className={`relative flex h-full items-center justify-center px-4 transition-all delay-300 duration-1000 ease-out md:px-6 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-2 text-xl leading-tight text-white md:mb-4 md:text-4xl lg:mb-6 lg:text-5xl xl:text-6xl">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="mb-4 text-sm leading-relaxed text-white/90 md:mb-8 md:text-base lg:mb-10 lg:text-lg xl:text-xl">
                {heroSlides[currentSlide].subtitle}
              </p>
              <button
                onClick={() => onNavigate && onNavigate("brand")}
                className="bg-white/90 px-5 py-2 text-sm font-medium text-black transition-all hover:bg-white md:px-8 md:py-3 md:text-base lg:px-10 lg:py-4 lg:text-lg"
              >
                자세히 보기
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - 모바일에서는 더 작게 */}
        <div className="absolute right-0 bottom-0 left-0 pb-4 md:pb-10 lg:pb-12">
          <div className="flex justify-center">
            <ChevronDown
              className="animate-scroll-down h-6 w-6 text-white/40 md:h-10 md:w-10 lg:h-12 lg:w-12"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Vertical Slide dots - 모바일에서는 더 작게 */}
        <div className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col gap-2 md:right-6 md:gap-3 lg:right-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-0.5 transition-all md:w-1 ${
                index === currentSlide
                  ? "h-4 bg-white md:h-6 lg:h-8"
                  : "h-0.5 bg-white/30 hover:bg-white/50 md:h-1"
              }`}
            />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS Section */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
          <div className="mb-4 md:mb-8">
            <h2 className="mb-1 text-lg text-white md:mb-2 md:text-2xl">
              NEW ARRIVALS
            </h2>
            <p className="text-xs text-gray-400 md:text-sm">
              최신 발매된 프리미엄 위스키
            </p>
          </div>

          {/* 모바일: 2열, 태블릿+: 4열 */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {recentProducts.map((product, index) => (
              <button
                key={index}
                onClick={() => onNavigate && onNavigate("archive")}
                className="group cursor-pointer border-b border-white/10 pb-2 text-left transition-colors hover:bg-white/5"
              >
                {/* Image - Square */}
                <div className="relative mb-2 flex aspect-square items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                  <div className="text-sm text-white/60 md:text-base">
                    {product.vintage}
                  </div>
                </div>

                {/* Content - More compact */}
                <div>
                  <p className="mb-0.5 text-xs text-gray-400">
                    {product.brand}
                  </p>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium text-white group-hover:text-gray-300">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {product.distillery}
                    </span>
                    <span className="text-xs text-gray-400">
                      {product.abv}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 text-center md:mt-8">
            <button
              onClick={() => onNavigate && onNavigate("archive")}
              className="inline-flex items-center gap-2 bg-white/90 px-5 py-2 text-xs text-black transition-all hover:bg-white md:px-6 md:py-2.5 md:text-sm"
            >
              전체 제품 보기
              <ArrowRight size={14} className="md:size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards - 모바일: 2x2, 태블릿+: 1x4 */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {/* OUR BRANDS Card */}
            <button
              onClick={() => onNavigate && onNavigate("brand")}
              className="group flex aspect-square flex-col items-center justify-center border border-white/10 bg-white/5 p-3 text-center transition-all hover:border-white/30 hover:bg-white/10 md:p-4"
            >
              <div className="mb-2 text-sm font-bold text-white md:mb-3 md:text-xl lg:text-2xl">
                OUR BRANDS
              </div>
              <div className="mb-3 text-[10px] leading-relaxed text-gray-400 md:mb-6 md:text-sm">
                다양한 브랜드를
                <br className="md:hidden" />
                <span className="hidden md:inline">
                  위스키내비에서 전개하고 있는
                  <br />
                </span>
                만나보세요
                <span className="hidden md:inline">
                  <br />
                  다양한 브랜드들을 만나보세요.
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors group-hover:text-white md:text-sm">
                바로가기 <ArrowRight size={12} className="md:size-4" />
              </div>
            </button>

            {/* ARCHIVE Card */}
            <button
              onClick={() => onNavigate && onNavigate("archive")}
              className="group flex aspect-square flex-col items-center justify-center border border-white/10 bg-white/5 p-3 text-center transition-all hover:border-white/30 hover:bg-white/10 md:p-4"
            >
              <div className="mb-2 text-sm font-bold text-white md:mb-3 md:text-xl lg:text-2xl">
                ARCHIVE
              </div>
              <div className="mb-3 text-[10px] leading-relaxed text-gray-400 md:mb-6 md:text-sm">
                발매 제품을
                <br className="md:hidden" />
                <span className="hidden md:inline">
                  위스키내비에서 발매한
                  <br />
                </span>
                둘러보세요
                <span className="hidden md:inline">
                  <br />
                  제품들을 둘러보세요.
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors group-hover:text-white md:text-sm">
                바로가기 <ArrowRight size={12} className="md:size-4" />
              </div>
            </button>

            {/* SHOP Card */}
            <button
              onClick={() => onNavigate && onNavigate("store")}
              className="group flex aspect-square flex-col items-center justify-center border border-white/10 bg-white/5 p-3 text-center transition-all hover:border-white/30 hover:bg-white/10 md:p-4"
            >
              <div className="mb-2 text-sm font-bold text-white md:mb-3 md:text-xl lg:text-2xl">
                SHOP
              </div>
              <div className="mb-3 text-[10px] leading-relaxed text-gray-400 md:mb-6 md:text-sm">
                전국 취급점
                <br className="md:hidden" />
                <span className="hidden md:inline">
                  전국 취급점에서 위스키내비
                  <br />
                </span>
                안내
                <span className="hidden md:inline">
                  <br />
                  제품군을 만나보실 수 있습니다.
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors group-hover:text-white md:text-sm">
                바로가기 <ArrowRight size={12} className="md:size-4" />
              </div>
            </button>

            {/* COMMUNITY Card */}
            <button
              onClick={() => onNavigate && onNavigate("community")}
              className="group flex aspect-square flex-col items-center justify-center border border-white/10 bg-white/5 p-3 text-center transition-all hover:border-white/30 hover:bg-white/10 md:p-4"
            >
              <div className="mb-2 text-sm font-bold text-white md:mb-3 md:text-xl lg:text-2xl">
                COMMUNITY
              </div>
              <div className="mb-3 text-[10px] leading-relaxed text-gray-400 md:mb-6 md:text-sm">
                커뮤니티
                <br className="md:hidden" />
                <span className="hidden md:inline">
                  위스키내비 커뮤니티에서
                  <br />
                </span>
                소식
                <span className="hidden md:inline">
                  <br />
                  다양한 소식들을 만나보세요.
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors group-hover:text-white md:text-sm">
                바로가기 <ArrowRight size={12} className="md:size-4" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="py-6 md:py-12">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
          <div className="mb-4 md:mb-8">
            <h2 className="mb-1 text-lg text-white md:mb-2 md:text-2xl">
              YOUTUBE
            </h2>
            <p className="text-xs text-gray-400 md:text-sm">
              위스키내비의 다양한 콘텐츠를 만나보세요
            </p>
          </div>

          <div className="group relative mb-4 aspect-video cursor-pointer overflow-hidden border border-white/10 bg-gray-900 transition-shadow hover:shadow-2xl md:mb-6">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1762983039765-43ab5b4fae8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlza3klMjBib3R0bGUlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3NjkzMTU2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="YouTube Video"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/30">
              <div className="bg-red-600 p-3 transition-all group-hover:scale-110 group-hover:bg-red-700 md:p-5 lg:p-6">
                <Youtube
                  size={20}
                  className="text-white md:size-8 lg:size-10"
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://www.youtube.com/@WhiskyNavi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-white transition-all hover:gap-3 hover:text-gray-300 md:text-sm lg:text-base"
            >
              더 많은 영상 보러가기
              <ArrowRight size={14} className="md:size-4 lg:size-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
