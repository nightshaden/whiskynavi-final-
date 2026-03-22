const ReservationHero = () => {
  return (
    <section className="relative h-[35vh] max-h-[400px] overflow-hidden lg:h-[40vh]">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1419] to-[#1d2429]">
        {/* Huge "RESERVE" Typography */}
        <div className="absolute inset-0 hidden items-center justify-center overflow-hidden lg:flex">
          <p
            className="text-[45vw] leading-none tracking-[0.02em] whitespace-nowrap text-white/[0.015] select-none sm:text-[42vw] md:text-[38vw] lg:text-[35vw]"
            style={{
              fontFamily: "D-DIN Condensed, sans-serif",
              fontWeight: 700,
            }}
          >
            RESERVE
          </p>
        </div>

        {/* Decorative Grid Lines - Asymmetric Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-gradient-to-b from-transparent via-white/35 to-transparent" />
          <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-gradient-to-b from-transparent via-white/45 to-transparent" />
          <div className="absolute top-0 right-[25%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          <div className="absolute top-0 right-[10%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/35 to-transparent" />

          <div className="absolute top-[35%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="absolute right-0 bottom-[35%] left-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        </div>

        {/* Accent Lines - Crossing diagonals */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-1/3 right-0 left-0 h-[1px] origin-center -rotate-3 transform bg-gradient-to-r from-transparent via-white/25 to-white/15" />
          <div className="absolute right-0 bottom-1/3 left-0 h-[1px] origin-center rotate-3 transform bg-gradient-to-r from-white/15 via-white/25 to-transparent" />
        </div>

        {/* Glowing Dots */}
        <div className="absolute inset-0">
          <div className="absolute top-[18%] left-[25%] h-2 w-2 rounded-full bg-white opacity-60" />
          <div className="absolute top-[45%] right-[18%] h-2 w-2 rounded-full bg-white opacity-60" />
          <div className="absolute bottom-[22%] left-[55%] h-1.5 w-1.5 rounded-full bg-white opacity-40" />
          <div className="absolute top-[65%] left-[15%] h-1.5 w-1.5 rounded-full bg-white opacity-50" />
          <div className="absolute top-[28%] right-[35%] h-1 w-1 rounded-full bg-white opacity-35" />
          <div className="absolute right-[8%] bottom-[40%] h-1 w-1 rounded-full bg-white opacity-35" />
        </div>

        {/* Fade out gradient at bottom */}
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-b from-transparent to-[#1d2429]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mx-auto max-w-4xl text-center">
            <h1
              className="typo-bold-36 md:text-5xl mb-5 tracking-tight text-white lg:text-6xl"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
            >
              예약하기
            </h1>

            <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 md:w-32 lg:w-40" />

            <p className="text-sm leading-relaxed font-light tracking-wider text-white/80 italic md:text-base lg:text-lg">
              위스키내비의 신규 출시 제품을 예약하세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReservationHero;
