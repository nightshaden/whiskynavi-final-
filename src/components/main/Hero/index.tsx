"use client";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useState } from "react";

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
      className="relative h-screen w-full"
    >
      <CarouselContent className="h-screen">
        {heroItems.map((item) => (
          <CarouselItem key={item.id} className="h-screen pl-0">
            <HeroItem item={item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Carousel Indicator Dots */}
      <div className="absolute bottom-25 left-1/2 z-20 flex -translate-x-1/2 gap-5">
        {heroItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => api?.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              current === index
                ? "h-2.5 w-6.25 bg-[#5D5D5D]"
                : "h-2.5 w-2.5 bg-white"
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
      className="relative h-screen w-full bg-cover bg-center pt-30 before:absolute before:inset-0 before:z-0 before:bg-black/70"
      style={{ backgroundImage: `url(${item.bgImage})` }}
    >
      <div className="relative z-10 mx-auto h-full max-w-screen-xl pb-50">
        <div className="mb-21 flex h-full justify-between px-30">
          <div className="flex w-full max-w-[600px] flex-col justify-center">
            <h2 className="typo-bold-36 whitespace-pre-line text-white">
              {item.title.replace(" : ", " \n: ")}
            </h2>
            <p className="typo-medium-18 mt-10 leading-loose whitespace-pre-line text-white">
              {item.description}
            </p>
            <Button color="white" className="mt-10 w-fit rounded-none bg-white">
              <p className="typo-bold-16 text-black">예약 매장 확인</p>
            </Button>
          </div>
          <div className="flex items-center">
            <Image src={item.image} alt="hero-image" width={440} height={520} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
