import { type BannerResponse, getApiBannersId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import BannerEditContent from "./_components/BannerEditContent";

interface BannerEditPageProps {
  params: Promise<{ bannerId: string }>;
}

export default async function BannerEditPage({ params }: BannerEditPageProps) {
  const { bannerId } = await params;
  const token = await getAuthToken();

  let banner: BannerResponse | undefined;
  try {
    const res = await getApiBannersId(Number(bannerId), withToken(token));
    banner = res.data;
  } catch {
    notFound();
  }

  return <BannerEditContent banner={banner} />;
}
