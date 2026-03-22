const ListHero = () => {
  return (
    <section className="relative h-[35vh] max-h-[400px] overflow-hidden lg:h-[40vh]">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1419] to-[#1d2429]">
        {/* Huge "ARCHIVE" Typography - Abstract Background Pattern */}
        <div className="absolute inset-0 hidden items-center justify-center overflow-hidden lg:flex">
          <p
            className="text-[45vw] leading-none tracking-[0.02em] whitespace-nowrap text-white/[0.015] select-none sm:text-[42vw] md:text-[38vw] lg:text-[35vw]"
            style={{
              fontFamily: "D-DIN Condensed, sans-serif",
              fontWeight: 700,
            }}
          >
            ARCHIVE
          </p>
        </div>

        {/* Decorative Grid Lines - Different Pattern */}
        <div className="absolute inset-0 opacity-20">
          {/* Diagonal cross grid - more vertical lines */}
          <div className="absolute top-0 bottom-0 left-[15%] w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
          <div className="absolute top-0 right-[35%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-0 right-[15%] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

          {/* Horizontal lines at different positions */}
          <div className="absolute top-[25%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <div className="absolute top-[50%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute top-[75%] right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        </div>

        {/* Accent Lines - Single diagonal */}
        <div className="absolute inset-0">
          {/* Top accent line */}
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Single diagonal accent line */}
          <div className="absolute top-0 right-0 left-0 h-[1px] origin-center rotate-1 transform bg-gradient-to-r from-white/30 via-transparent to-white/20"></div>
        </div>

        {/* Glowing Dots - Different positions and count */}
        <div className="absolute inset-0">
          <div className="absolute top-[20%] left-[12%] h-2 w-2 rounded-full bg-white opacity-60"></div>
          <div className="absolute top-[55%] right-[15%] h-2 w-2 rounded-full bg-white opacity-60"></div>
          <div className="absolute bottom-[25%] left-[65%] h-1.5 w-1.5 rounded-full bg-white opacity-40"></div>
          <div className="absolute top-[75%] left-[30%] h-1.5 w-1.5 rounded-full bg-white opacity-40"></div>
          <div className="absolute top-[35%] right-[25%] h-1.5 w-1.5 rounded-full bg-white opacity-50"></div>
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
              아카이브
            </h1>

            {/* Animated Gradient Line */}
            <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 md:w-32 lg:w-40"></div>

            {/* Subtitle - Italic & Spaced */}
            <p className="text-sm leading-relaxed font-light tracking-wider text-white/80 italic md:text-base lg:text-lg">
              위스키내비에서 발매한 모든 제품을 둘러보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListHero;
