import { getApiBottlesReservationsNoticesNoticeid } from "@/apis/generated/api";
import { authOptions } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { fetchPickupLocations } from "../_lib/fetchPickupLocations";
import ReservationDetailClient from "./_components/ReservationDetailClient";

type PageProps = {
  params: Promise<{ noticeId: string }>;
};

export default async function ReservationDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/sign-in?callbackUrl=/reservation");
  }

  const { noticeId } = await params;
  const id = Number(noticeId);
  if (Number.isNaN(id)) notFound();

  let notice;
  try {
    const res = await getApiBottlesReservationsNoticesNoticeid(id);
    notice = res.data;
  } catch {
    notFound();
  }

  const pickupLocations = await fetchPickupLocations();

  return (
    <div className="mt-20 min-h-screen bg-[#1d2429]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 lg:px-10 lg:py-12">
        {/* Back Button */}
        <Link
          href="/reservation"
          className="mt-4 mb-3 flex items-center gap-2 text-white/70 transition-colors hover:text-white lg:mt-0 lg:mb-8"
        >
          <ArrowLeft size={18} className="lg:hidden" />
          <ArrowLeft size={20} className="hidden lg:block" />
          <span className="typo-bold-14 lg:text-base">목록으로 돌아가기</span>
        </Link>

        <ReservationDetailClient
          notice={notice}
          pickupLocations={pickupLocations}
        />
      </div>
    </div>
  );
}
