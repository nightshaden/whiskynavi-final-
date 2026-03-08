/**
 * 배너 시드 스크립트
 * 사용: ACCESS_TOKEN=<토큰> npx tsx scripts/seed-banners.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("ACCESS_TOKEN 환경변수가 필요합니다.");
  process.exit(1);
}

const banners = [
  {
    title: "더 위스키테일즈 : 여름 바캉스",
    description: "링크우드 증류소의 달큼한 청사과 뉘앙스",
  },
  {
    title: "투게더 인 스피릿",
    description: "위스키 애호가들과 함께하는 새로운 여정",
  },
  {
    title: "스코틀랜드 증류소 방문기",
    description: "마스터 디스틸러와 함께한 캐스크 선정의 순간",
  },
];

const imgPath = resolve(process.cwd(), "public/bg-sample.png");
const imgBuffer = readFileSync(imgPath);
const imgFile = new File([imgBuffer], "bg-sample.png", { type: "image/png" });

async function createBanner(banner: { title: string; description: string }) {
  const params = new URLSearchParams({
    title: banner.title,
    description: banner.description,
  });

  const formData = new FormData();
  formData.append("backgroundImg", imgFile);
  formData.append("mainImg", imgFile);

  const res = await fetch(`${BASE_URL}/api/admin/banners?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[${res.status}] ${text}`);
  }

  return res.json();
}

async function main() {
  console.log("배너 시드 시작...");

  for (const banner of banners) {
    const result = await createBanner(banner);
    console.log(`생성 완료: ${banner.title}`, result);
  }

  console.log("배너 시드 완료!");
}

main().catch((err) => {
  console.error("시드 실패:", err);
  process.exit(1);
});
