import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "375px",
      // 태블릿
      md: "640px",
      // 데스크탑
      lg: "1440px",
      xl: "1600px",
      "2xl": "1920px",
    },
    extend: {
      colors: {
        red: {
          900: "#A50D17",
          800: "#C51521",
          700: "#EB1A28",
          600: "#FF303E",
          500: "#FF5762",
          400: "#FF8B93",
          300: "#FFAAB0",
          200: "#FFC5C9",
          100: "#FFDCDE",
          50: "#FFF0F0",
        },
        gray: {
          900: "#1E1E1E",
          800: "#2F2F2F",
          700: "#505050",
          600: "#6F6F6F",
          500: "#959595",
          400: "#BBBBBB",
          300: "#D1D1D1",
          200: "#E4E4E4",
          100: "#EDEDED",
          70: "#F3F3F3",
          50: "#F9F9F9",
        },
        blue: {
          900: "#003BAC",
          800: "#004DE2",
          700: "#0D60FF",
          600: "#367AFF",
          500: "#548FFF",
          400: "#6FA1FF",
          300: "#A9C7FF",
          200: "#C8DBFF",
          100: "#DEE9FF",
          50: "#EDF3FF",
        },
        green: {
          900: "#00792B",
          800: "#039A37",
          700: "#03B642",
          600: "#00CA47",
          500: "#25D161",
          400: "#45DA79",
          300: "#68E393",
          200: "#85EFAB",
          100: "#AAF0C3",
          50: "#CEF7DD",
        },
        yellow: {
          600: "#FFC422",
        },
        special: {
          50: "#E1FFF7",
          600: "#00C18D",
        },
        "core-neo-green": {
          900: "#53A600",
          800: "#84C70E",
          700: "#B5E81C",
          600: "#CCFF55",
          500: "#D3FF6D",
          400: "#DBFF86",
          300: "#E3FF9E",
          200: "#E9FFB7",
          100: "#F0FFCE",
          50: "#F8FFE7",
        },
      },
      borderRadius: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        100: "100px",
      },
    },
    animation: {
      "button-scale":
        "button-scale 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    },
    keyframes: {
      "button-scale": {
        "0%": { transform: "scale(1)" },
        "100%": { transform: "scale(0.9)" },
      },
      pulse: {
        "0%, 100%": { opacity: "1" },
        "50%": { opacity: ".5" },
      },
    },
  },
  // 플러그인은 CSS의 @layer components로 이동했습니다 (globals.css 참조)
  plugins: [],
};
export default config;
