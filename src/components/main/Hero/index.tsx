"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type HeroItem = {
  id: string;
  bgImage: string;
  image: string;
  title: string;
  description: string;
};

const Hero = () => {
  const heroItems: HeroItem[] = [
    {
      id: "summer-vacance",
      bgImage: "/bg-sample.png",
      image: "/sample-v1.png",
      title: "더 위스키테일즈 : 여름 바캉스",
      description:
        "해변 휴가를 즐기는 카린과 지나를 만나보세요!\n링크우드 증류소 특유의 달콤함과\n풋사과 향이 어우러진 인상적인 병입니다.",
    },
    // {
    //   id: "summer-vacance",
    //   bgImage: "/bg-sample.png",
    //   image: "/sample-v1.png",
    //   title: "더 위스키테일즈 : 여름 바캉스",
    //   description:
    //     "해변 휴가를 즐기는 카린과 지나를 만나보세요!\n링크우드 증류소 특유의 달콤함과\n풋사과 향이 어우러진 인상적인 병입니다.",
    // },
    // {
    //   id: "summer-vacance",
    //   bgImage: "/bg-sample.png",
    //   image: "/sample-v1.png",
    //   title: "더 위스키테일즈 : 여름 바캉스",
    //   description:
    //     "해변 휴가를 즐기는 카린과 지나를 만나보세요!\n링크우드 증류소 특유의 달콤함과\n풋사과 향이 어우러진 인상적인 병입니다.",
    // },
  ];

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "start",
        loop: true,
      }}
      className="relative w-full h-screen"
    >
      <CarouselContent className="h-screen">
        {heroItems.map((item) => (
          <CarouselItem key={item.id} className="pl-0 h-screen">
            <HeroItem item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Carousel Indicator Dots */}
      <div className="absolute bottom-25 left-1/2 -translate-x-1/2 z-20 flex gap-5">
        {heroItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              current === index
                ? "w-6.25 h-2.5 bg-[#5D5D5D]"
                : "w-2.5 h-2.5 bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Carousel>
  );
};

const HeroItem = ({ item }: { item: HeroItem }) => {
  return (
    <section
      className="relative w-full h-screen pt-30 bg-cover bg-center before:absolute before:inset-0 before:bg-black/70 before:z-0"
      style={{ backgroundImage: `url(${item.bgImage})` }}
    >
      <div className="relative h-full z-10 max-w-screen-lg pb-100 mx-auto">
        <div className="h-full flex justify-between px-30 mb-21">
          <div className="w-full max-w-[600px] flex flex-col justify-center">
            <h2 className="typo-bold-36 text-white whitespace-pre-line">
              {item.title.replace(" : ", " \n: ")}
            </h2>
            <p className="leading-loose typo-medium-18 text-white mt-10 whitespace-pre-line">
              {item.description}
            </p>
            <Button color="white" className="mt-10 bg-white rounded-none w-fit">
              <p className="typo-bold-16 text-black">예약 매장 확인</p>
            </Button>
          </div>
          <div className="flex items-center">
            <Image src={item.image} alt="hero-image" width={300} height={355} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
