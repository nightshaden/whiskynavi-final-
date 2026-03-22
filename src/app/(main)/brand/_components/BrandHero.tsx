const BrandHero = () => {
  return (
    <section className="relative h-[35vh] max-h-[400px] overflow-hidden lg:h-[40vh]">
      {/* Gradient Background with fade out */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1419] to-[#1d2429]">
        {/* Huge "BRANDS" Typography - Abstract Background Pattern */}
        <div className="absolute inset-0 hidden items-center justify-center overflow-hidden lg:flex">
          <p
            className="text-[45vw] leading-none tracking-[0.02em] whitespace-nowrap text-white/[0.015] select-none sm:text-[42vw] md:text-[38vw] lg:text-[35vw]"
            style={{
              fontFamily: "D-DIN Condensed, sans-serif",
              fontWeight: 700,
            }}
          >
            BRANDS
          </p>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          {/* Vertical lines */}
          <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-[40%] w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-0 right-[40%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-0 right-[20%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>

          {/* Horizontal lines */}
          <div className="absolute top-[30%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-[70%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Accent Lines */}
        <div className="absolute inset-0">
          {/* Top accent line */}
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Diagonal accent lines */}
          <div className="absolute top-1/4 right-0 left-0 h-[1px] origin-center -rotate-2 transform bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
          <div className="absolute right-0 bottom-1/4 left-0 h-[1px] origin-center rotate-2 transform bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
        </div>

        {/* Glowing Dots */}
        <div className="absolute inset-0">
          <div className="absolute top-[25%] left-[15%] h-2 w-2 rounded-full bg-white opacity-60"></div>
          <div className="absolute top-[60%] right-[20%] h-2 w-2 rounded-full bg-white opacity-60"></div>
          <div className="absolute bottom-[30%] left-[70%] h-1.5 w-1.5 rounded-full bg-white opacity-40"></div>
          <div className="absolute top-[45%] left-[85%] h-1.5 w-1.5 rounded-full bg-white opacity-40"></div>
        </div>

        {/* Fade out gradient at bottom */}
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-b from-transparent to-[#1d2429]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="mx-auto max-w-4xl text-center">
            {/* Main Title - Bold & Dynamic */}
            <h1
              className="typo-bold-36 md:text-5xl mb-5 tracking-tight text-white lg:text-6xl"
              style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
            >
              브랜드
            </h1>

            {/* Animated Gradient Line */}
            <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 md:w-32 lg:w-40"></div>

            {/* Subtitle - Italic & Spaced */}
            <p className="text-sm leading-relaxed font-light tracking-wider text-white/80 italic md:text-base lg:text-lg">
              위스키내비의 브랜드 라인을 만나보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandHero;
