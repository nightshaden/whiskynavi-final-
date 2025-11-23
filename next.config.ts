/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Turbopack 설정 추가
  turbopack: {
    rules: {
      // .svg를 SVGR로 JS(리액트 컴포넌트)로 변환
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                  { name: "removeDimensions", active: true },
                ],
              },
              titleProp: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },

  // (선택) webpack 설정이 이미 있다면, svg를 asset 로더에서 제외하는 기존 부분은 남겨도 무방하지만
  // Turbopack만 쓴다면 아래 webpack 블록 자체를 지워도 됩니다.
  // webpack(config) {
  //   const assetRule = config.module.rules.find((r) => r.test?.test?.('.svg'));
  //   if (assetRule) assetRule.exclude = /\.svg$/i;
  //   config.module.rules.push({
  //     test: /\.svg$/i,
  //     issuer: /\.[jt]sx?$/,
  //     use: [{ loader: '@svgr/webpack', options: { /* ... */ } }],
  //   });
  //   return config;
  // },
};

module.exports = nextConfig;
