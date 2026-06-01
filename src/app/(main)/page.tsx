import {
  getApiBanners,
  getApiBottles,
  getApiKvStore,
  type BottleResponse,
  type UserBannerResponse,
} from "@/apis/generated/api";
import { YOUTUBE_KEY } from "../admin/youtube/constants";
import BannerSection from "./_components/BannerSection";
import NewArrivals from "./_components/NewArrivals";
import RestOfPage from "./_components/RestOfPage";

export default async function HomePage() {
  const [bannersResponse, bottlesResponse, youtubeResponse] = await Promise.all([
    getApiBanners({ page: 0, size: 10 }).catch(() => ({
      data: { content: [] as UserBannerResponse[] },
    })),
    getApiBottles({
      page: 0,
      size: 8,
      sort: ["bottledDate,desc"],
    }).catch(() => ({
      data: { content: [] as BottleResponse[] },
    })),
    getApiKvStore(YOUTUBE_KEY).catch(() => ({
      data: { value: "" },
    })),
  ]);

  const banners =
    bannersResponse.data.content?.filter((b): b is UserBannerResponse & { title: string } => !!b.title) ?? [];

  const bottles = bottlesResponse.data.content ?? [];
  const youtubeEmbedUrl = youtubeResponse.data.value ?? "";

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <BannerSection banners={banners} />
      <NewArrivals bottles={bottles} />
      <RestOfPage youtubeEmbedUrl={youtubeEmbedUrl} />
    </div>
  );
}
