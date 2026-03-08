import { type BannerResponse, getApiBannersId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import BannerDetailContent from "./_components/BannerDetailContent";

interface BannerDetailPageProps {
  params: Promise<{ bannerId: string }>;
}

export default async function BannerDetailPage({
  params,
}: BannerDetailPageProps) {
  const { bannerId } = await params;
  const token = await getAuthToken();

  let banner: BannerResponse | undefined;
  try {
    const res = await getApiBannersId(Number(bannerId), withToken(token));
    banner = res.data;
  } catch {
    notFound();
  }

  return <BannerDetailContent banner={banner} />;
}
