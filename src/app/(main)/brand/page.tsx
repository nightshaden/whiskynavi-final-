import { getApiBottles, type BottleResponse } from "@/apis/generated/api";
import type { Brand } from "@/types/brand";
import Hero from "../_components/Hero";
import BrandContent from "./_components/BrandContent";
import { NAVI, TAILS, TOGETHER_IN_SPIRIT, TRAIL_AND_TAIL } from "./_constants";

const BRANDS: Brand[] = [NAVI, TAILS, TRAIL_AND_TAIL, TOGETHER_IN_SPIRIT];

const Page = async () => {
  const brandBottlesEntries = await Promise.all(
    BRANDS.map(async (brand) => {
      try {
        const { data } = await getApiBottles({
          filters: {
            brand: [brand.id],
            pageNumber: 0,
            pageSize: 6,
          },
        });
        return [brand.id, data.content ?? []] as const;
      } catch {
        return [brand.id, []] as const;
      }
    }),
  );

  const bottlesMap: Record<string, BottleResponse[]> =
    Object.fromEntries(brandBottlesEntries);

  return (
    <main className="min-h-screen bg-[#1d2429]">
      <Hero
        backgroundText="BRANDS"
        title="브랜드"
        subtitle="위스키내비의 브랜드 라인을 만나보세요."
      />
      <BrandContent brands={BRANDS} bottlesMap={bottlesMap} />
      <div className="h-[114px]" />
    </main>
  );
};

export default Page;
