import { Suspense } from "react";
import DashboardContent from "./_components/DashboardContent";
import DashboardStats from "./_components/DashboardStats";
import DashboardStatsSkeleton from "./_components/DashboardStatsSkeleton";

export default function AdminDashboardPage() {
  return (
    <DashboardContent
      statsSlot={
        <Suspense fallback={<DashboardStatsSkeleton />}>
          <DashboardStats />
        </Suspense>
      }
    />
  );
}
