import {
  getApiBanners,
  getApiBottles,
  type BannerResponse,
  type BottleResponse,
  type GetApiBottlesParams,
} from "@/apis/generated/api";
import BannerSection from "./_components/BannerSection";
import NewArrivals from "./_components/NewArrivals";
import RestOfPage from "./_components/RestOfPage";

export default async function HomePage() {
  const [bannersResponse, bottlesResponse] = await Promise.all([
    getApiBanners({ page: 0, size: 10 }).catch(() => ({
      data: { content: [] as BannerResponse[] },
    })),
    getApiBottles({
      filters: { pageNumber: 0, pageSize: 8 },
      sort: "bottledDate,desc",
    } as GetApiBottlesParams & { sort: string }).catch(() => ({
      data: { content: [] as BottleResponse[] },
    })),
  ]);

  const banners =
    bannersResponse.data.content?.filter(
      (b): b is BannerResponse & { title: string } => !!b.title,
    ) ?? [];

  const bottles = bottlesResponse.data.content ?? [];

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <BannerSection banners={banners} />
      <NewArrivals bottles={bottles} />
      <RestOfPage />
    </div>
  );
}
