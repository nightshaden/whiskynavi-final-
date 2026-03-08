import type { Brand } from "@/types/brand";
import {
  getApiBottles,
  type BottleResponse,
  type GetApiBottlesParams,
} from "@/apis/generated/api";
import BrandHero from "./_components/BrandHero";
import BrandContent from "./_components/BrandContent";
import { NAVI, TAILS, TOGETHER_IN_SPIRIT, TRAIL_AND_TAIL } from "./_constants";

const BRANDS: Brand[] = [NAVI, TAILS, TRAIL_AND_TAIL, TOGETHER_IN_SPIRIT];

const Page = async () => {
  const brandBottlesEntries = await Promise.all(
    BRANDS.map(async (brand) => {
      const { data } = await getApiBottles({
        filters: {
          brand: brand.id,
          pageNumber: 0,
          pageSize: 6,
        } as GetApiBottlesParams["filters"],
      });
      return [brand.id, data.content ?? []] as const;
    }),
  );

  const bottlesMap: Record<string, BottleResponse[]> =
    Object.fromEntries(brandBottlesEntries);

  return (
    <main className="min-h-screen bg-[#1d2429]">
      <BrandHero />
      <BrandContent brands={BRANDS} bottlesMap={bottlesMap} />
      <div className="h-[114px]" />
    </main>
  );
};

export default Page;
