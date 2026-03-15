import {
  getApiBottlesReservationsNoticesLatestActive,
  getApiBottlesReservationsNoticesRecentEnded,
} from "@/apis/generated/api";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { fetchPickupLocations } from "./_lib/fetchPickupLocations";
import ActiveReservationSection from "./_components/ActiveReservationSection";
import EmptyState from "./_components/EmptyState";
import RecentEndedSection from "./_components/RecentEndedSection";
import ReservationHero from "./_components/ReservationHero";
import UnauthenticatedGuard from "./_components/UnauthenticatedGuard";

export default async function ReservationPage() {
  const session = await getServerSession(authOptions);

  // 비로그인 사용자: 로그인 유도
  if (!session) {
    return (
      <div className="min-h-screen bg-[#1d2429]">
        <ReservationHero />
        <div className="mx-auto max-w-[1440px] px-4 pt-3 pb-12 lg:px-10 lg:pt-2">
          <UnauthenticatedGuard />
        </div>
      </div>
    );
  }

  // 병렬 API 호출
  const [activeResult, recentEndedResult, pickupLocations] =
    await Promise.all([
      getApiBottlesReservationsNoticesLatestActive().catch(() => null),
      getApiBottlesReservationsNoticesRecentEnded().catch(() => null),
      fetchPickupLocations(),
    ]);

  // latest-active는 단일 객체 → 배열로 변환
  const activeNotices =
    activeResult?.data ? [activeResult.data] : [];

  const recentEndedNotices =
    recentEndedResult?.data ?? [];

  const hasNoData =
    activeNotices.length === 0 && recentEndedNotices.length === 0;

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <ReservationHero />
      <div className="mx-auto max-w-[1440px] px-4 pt-3 pb-12 lg:px-10 lg:pt-2">
        <main className="flex-1 bg-[#1d2429]">
          {hasNoData ? (
            <EmptyState />
          ) : (
            <>
              <ActiveReservationSection notices={activeNotices} pickupLocations={pickupLocations} />
              <RecentEndedSection notices={recentEndedNotices} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
