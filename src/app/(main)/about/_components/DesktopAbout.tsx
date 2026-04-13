"use client";

import { ChevronDown, ClipboardCheck, Droplet, Ship, Users } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function DesktopAbout() {
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const horizontalSection = horizontalScrollRef.current;
      if (!horizontalSection) return;

      const rect = horizontalSection.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      if (sectionTop <= 0 && sectionTop > -sectionHeight + viewportHeight) {
        const scrollProgress = Math.abs(sectionTop);
        const maxScroll = sectionHeight - viewportHeight;
        const scrollPercentage = Math.min(scrollProgress / maxScroll, 1);

        const slideIndex = Math.floor(scrollPercentage * 3);
        setCurrentSlide(Math.min(slideIndex, 2));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hidden min-h-screen bg-[#1d2429] lg:block">
      {/* Section 1: Full Screen Hero */}
      <motion.section
        className="relative flex h-[calc(100vh-80px)] items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-b from-[#0a0e11] via-[#141a1f] to-[#1d2429]">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1920 1080' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,80 Q960,70 1920,80' stroke='rgba(255,255,255,0.4)' stroke-width='1' fill='none'/%3E%3Cpath d='M0,140 Q960,135 1920,140' stroke='rgba(255,255,255,0.3)' stroke-width='1' fill='none'/%3E%3Cpath d='M0,200 Q960,195 1920,200' stroke='rgba(255,255,255,0.25)' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
            }}
          ></div>

          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1920 1080' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,880 Q480,860 960,880 Q1440,900 1920,880' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0,920 Q480,905 960,925 Q1440,935 1920,920' stroke='rgba(255,255,255,0.6)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0,970 Q480,950 960,970 Q1440,985 1920,965' stroke='rgba(255,255,255,0.7)' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0,1020 Q480,1005 960,1025 Q1440,1035 1920,1020' stroke='rgba(255,255,255,0.8)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,1) 95%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,1) 95%)",
            }}
          ></div>

          {/* Diagonal Accent Lines */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 -left-20 h-px w-96 -rotate-12 transform bg-linear-to-r from-transparent via-white/60 to-transparent"></div>
            <div className="absolute top-1/3 -right-20 h-px w-80 rotate-12 transform bg-linear-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="absolute bottom-1/3 left-1/4 h-px w-64 -rotate-6 transform bg-linear-to-r from-white/40 via-transparent to-transparent"></div>
          </div>

          {/* Star-like Accent Dots */}
          <div className="absolute inset-0">
            <div className="absolute top-[15%] left-[12%] h-1.5 w-1.5 rounded-full bg-white/50"></div>
            <div className="absolute top-[8%] left-[25%] h-1 w-1 rounded-full bg-white/40"></div>
            <div className="absolute top-[12%] right-[28%] h-1 w-1 rounded-full bg-white/35"></div>
            <div className="absolute top-[18%] right-[15%] h-1.5 w-1.5 rounded-full bg-white/45"></div>
            <div className="absolute top-[40%] left-[18%] h-1 w-1 rounded-full bg-white/40"></div>
            <div className="absolute top-[45%] left-[8%] h-1.5 w-1.5 rounded-full bg-white/50"></div>
            <div className="absolute top-[50%] right-[20%] h-1 w-1 rounded-full bg-white/40"></div>
            <div className="absolute bottom-[25%] left-[22%] h-1 w-1 rounded-full bg-white/35"></div>
            <div className="absolute bottom-[30%] left-[45%] h-1.5 w-1.5 rounded-full bg-white/45"></div>
            <div className="absolute right-[25%] bottom-[20%] h-1 w-1 rounded-full bg-white/40"></div>
            <div className="absolute right-[12%] bottom-[28%] h-2 w-2 rounded-full bg-white/50"></div>
            <div className="absolute right-[40%] bottom-[15%] h-1 w-1 rounded-full bg-white/35"></div>
          </div>

          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-[1440px] px-20">
          <div className="mx-auto max-w-5xl">
            {/* Desktop Logo */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <Image
                src="/about/text-logo.png"
                alt="WHISKYNAVI"
                width={300}
                height={96}
                className="mx-auto mb-3 h-24 w-auto object-contain md:mb-6 xl:h-28"
              />
            </motion.div>

            <div
              className="mt-12 flex flex-col items-center text-xl leading-relaxed text-white/70 xl:text-2xl"
              style={{ wordBreak: "keep-all" }}
            >
              <motion.p
                className="typo-bold-24 xl:typo-bold-30 mb-20 px-4 text-center text-white/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                대한민국 최초의 독립 병입 브랜드, 위스키내비
              </motion.p>
              <div className="flex flex-col items-center space-y-2 px-4">
                <motion.p
                  className="typo-regular-18 xl:typo-regular-20 max-w-5xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  2020년 설립 이래, 다양한 증류소의 우수한 캐스크를 선별 및 병입하여 국내외 시장에 선보이고 있습니다.
                </motion.p>
                <motion.p
                  className="typo-regular-18 xl:typo-regular-20 max-w-5xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  정교한 셀렉션과 멈추지 않는 도전 정신으로 독립 병입 시장의 새로운 항로를 개척해 나가겠습니다.
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute right-0 bottom-0 left-0 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="flex justify-center">
            <ChevronDown className="animate-scroll-down h-12 w-12 text-white/40" strokeWidth={1.5} />
          </div>
        </motion.div>
      </motion.section>

      {/* Section 2: Horizontal Scroll - Three Principles */}
      <div ref={horizontalScrollRef} className="relative bg-[#1d2429]" style={{ height: "400vh" }}>
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* DISCOVER */}
          <div
            className={`absolute inset-0 flex items-center transition-opacity duration-1000 ${currentSlide === 0 ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src="/about/bg-barrel.png"
              alt=""
              width={1920}
              height={1080}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${currentSlide === 0 ? "opacity-100" : "opacity-0"}`}
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#1d2429] via-[#1d2429]/80 to-transparent" />

            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-20">
              <div className="max-w-4xl pl-12">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{
                    opacity: currentSlide === 0 ? 1 : 0,
                    x: currentSlide === 0 ? 0 : -50,
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="mb-8 h-0.5 w-20 bg-white"></div>
                  <h2
                    className="mb-10 text-7xl tracking-wider text-white xl:text-8xl"
                    style={{
                      fontFamily: "D-DIN Condensed, sans-serif",
                      WebkitTextStroke: "2px white",
                    }}
                  >
                    DISCOVER
                  </h2>
                  <p
                    className="typo-regular-24 xl:typo-regular-30 pr-4 leading-relaxed text-white/80"
                    style={{ wordBreak: "keep-all" }}
                  >
                    신생 증류소 탐색 부터 원액 소싱, 캐스크 블렌딩까지
                    <br />
                    다채로운 위스키를 제공하기 위해 끊임없이 탐구합니다.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* TASTE */}
          <div
            className={`absolute inset-0 flex items-center transition-opacity duration-1000 ${currentSlide === 1 ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${currentSlide === 1 ? "opacity-100" : "opacity-0"}`}
              style={{
                backgroundImage: `url('/about/bg-glass.png')`,
                backgroundSize: "cover",
                backgroundPosition: "0% center",
              }}
            ></div>
            <div className="absolute inset-0 bg-linear-to-r from-transparent from-30% via-[#1d2429]/70 via-50% to-[#1d2429] to-70%" />
            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-20">
              <div className="ml-auto max-w-2xl pr-12 text-right">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{
                    opacity: currentSlide === 1 ? 1 : 0,
                    x: currentSlide === 1 ? 0 : 50,
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="mb-8 ml-auto h-0.5 w-20 bg-white"></div>
                  <h2
                    className="mb-10 text-7xl tracking-wider text-white xl:text-8xl"
                    style={{
                      fontFamily: "D-DIN Condensed, sans-serif",
                      WebkitTextStroke: "2px white",
                    }}
                  >
                    TASTE
                  </h2>
                  <p
                    className="typo-regular-24 xl:typo-regular-30 pl-4 leading-relaxed text-white/80"
                    style={{ wordBreak: "keep-all" }}
                  >
                    소비자의 취향에 맞는 위스키를 제공하는 것,
                    <br />
                    위스키내비의 최우선 목표입니다.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* NAVIGATE */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${currentSlide === 2 ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src="/about/bg-compass.png"
              alt=""
              width={1920}
              height={1080}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${currentSlide === 2 ? "opacity-[0.6]" : "opacity-0"}`}
            />
            <div className="absolute inset-0 bg-linear-to-br from-[#1d2429]/90 via-[#1d2429]/70 to-[#1d2429]/90" />

            <div className="relative z-10 mx-auto w-full max-w-[1440px] px-20">
              <div className="mx-auto max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: currentSlide === 2 ? 1 : 0,
                    scale: currentSlide === 2 ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <div className="mx-auto mb-8 h-0.5 w-20 bg-white"></div>
                  <h2
                    className="mb-10 text-7xl tracking-wider text-white xl:text-8xl"
                    style={{
                      fontFamily: "D-DIN Condensed, sans-serif",
                      WebkitTextStroke: "2px white",
                    }}
                  >
                    NAVIGATE
                  </h2>
                  <p
                    className="typo-regular-24 xl:typo-regular-30 px-4 leading-relaxed text-white/80"
                    style={{ wordBreak: "keep-all" }}
                  >
                    위스키 초심자부터 매니아까지,
                    <br />
                    다양하고 세분화된 라인업으로 위스키 애호가들의 길잡이가 되겠습니다.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`h-0.5 transition-all duration-500 ${
                  index === currentSlide ? "w-16 bg-white" : "w-8 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: WHAT WE DO */}
      <section className="border-t border-white/10 bg-[#1d2429] py-32">
        <div className="mx-auto max-w-[1440px] px-20">
          <div className="mb-16">
            <div className="mb-8 h-0.5 w-16 bg-white"></div>
            <h2
              className="mb-10 text-7xl tracking-wider text-white xl:text-8xl"
              style={{
                fontFamily: "D-DIN Condensed, sans-serif",
                WebkitTextStroke: "2px white",
              }}
            >
              WHAT WE DO
            </h2>
          </div>

          <div className="flex min-h-[500px] flex-row">
            {/* Spirit Sourcing */}
            <div className="group relative flex-1 overflow-hidden border-r border-white/10 px-6 py-12 transition-all duration-700 ease-out last:border-r-0 hover:flex-2">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                style={{
                  backgroundImage: `url('/about/spirit-sourcing.png')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6">
                  <Droplet className="mb-6 h-12 w-12 text-white/70 transition-colors group-hover:text-white" />
                  <h3
                    className="text-2xl tracking-wider text-white xl:text-3xl"
                    style={{ fontFamily: "D-DIN Condensed, sans-serif" }}
                  >
                    SPIRIT SOURCING
                  </h3>
                </div>

                <div className="absolute right-6 bottom-12 left-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500">
                  <div className="max-w-md space-y-4">
                    <p
                      className="typo-medium-16 leading-relaxed text-white/90 xl:text-lg"
                      style={{ wordBreak: "keep-all" }}
                    >
                      현지 파트너와의 탄탄한 협력을 통해
                      <br />
                      우수한 품질의 원액을 선별 및 소싱합니다.
                      <br />
                      원액의 잠재력을 극대화할 수 있는 캐스크를 매칭해,
                      <br />
                      증류소 본연의 매력을 위스키에 선명하게 담아냅니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cask Curation */}
            <div className="group relative flex-1 overflow-hidden border-r border-white/10 px-6 py-12 transition-all duration-700 ease-out last:border-r-0 hover:flex-2">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                style={{
                  backgroundImage: `url('/about/cask-curation.png')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6">
                  <ClipboardCheck className="mb-6 h-12 w-12 text-white/70 transition-colors group-hover:text-white" />
                  <h3
                    className="text-2xl tracking-wider text-white xl:text-3xl"
                    style={{ fontFamily: "D-DIN Condensed, sans-serif" }}
                  >
                    CASK CURATION
                  </h3>
                </div>

                <div className="absolute right-6 bottom-12 left-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500">
                  <div className="max-w-md space-y-4">
                    <p
                      className="typo-medium-16 leading-relaxed text-white/90 xl:text-lg"
                      style={{ wordBreak: "keep-all" }}
                    >
                      원액의 잠재력을 최고조로 끌어올릴 수 있는
                      <br /> 최적의 캐스크를 엄선합니다.
                      <br /> 체계적인 숙성 관리로 위스키의 풍미 변화를 추적해,
                      <br /> 가장 완성도 높은 병입 시점을 찾아냅니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Import */}
            <div className="group relative flex-1 overflow-hidden border-r border-white/10 px-6 py-12 transition-all duration-700 ease-out last:border-r-0 hover:flex-2">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                style={{
                  backgroundImage: `url('/about/cask-import.png')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6">
                  <Ship className="mb-6 h-12 w-12 text-white/70 transition-colors group-hover:text-white" />
                  <h3
                    className="text-2xl tracking-wider text-white xl:text-3xl"
                    style={{ fontFamily: "D-DIN Condensed, sans-serif" }}
                  >
                    IMPORT
                  </h3>
                </div>

                <div className="absolute right-6 bottom-12 left-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500">
                  <div className="max-w-md space-y-4">
                    <p
                      className="typo-medium-16 leading-relaxed text-white/90 xl:text-lg"
                      style={{ wordBreak: "keep-all" }}
                    >
                      경쟁력 있는 해외 위스키 브랜드를
                      <br /> 공식 수입 및 유통합니다.
                      <br /> 위스키내비 자체 라인업뿐만 아니라, 해외의 다양한
                      <br /> 증류소 및 브랜드와 독점 파트너십을 맺어
                      <br /> 다채로운 선택지를 국내 시장에 제안합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* OEM */}
            <div className="group relative flex-1 overflow-hidden border-r border-white/10 px-6 py-12 transition-all duration-700 ease-out last:border-r-0 hover:flex-2">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                style={{
                  backgroundImage: `url('/about/cask-oem.png')`,
                }}
              ></div>
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6">
                  <Users className="mb-6 h-12 w-12 text-white/70 transition-colors group-hover:text-white" />
                  <h3
                    className="text-2xl tracking-wider text-white xl:text-3xl"
                    style={{ fontFamily: "D-DIN Condensed, sans-serif" }}
                  >
                    OEM
                  </h3>
                </div>

                <div className="absolute right-6 bottom-12 left-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-300 group-hover:duration-500">
                  <div className="max-w-md space-y-4">
                    <p
                      className="typo-medium-16 leading-relaxed text-white/90 xl:text-lg"
                      style={{ wordBreak: "keep-all" }}
                    >
                      기업 및 개인 고객을 위한
                      <br /> 맞춤형 위스키 제조 솔루션을 제공합니다.
                      <br /> 고객의 니즈와 아이덴티티를 반영한 원액 블렌딩부터
                      <br /> 바틀 선택, 라벨 디자인에 이르기까지
                      <br /> 완성도 높은 제품을 위한 전 과정을 지원합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
