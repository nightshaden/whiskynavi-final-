import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAuthToken } from "@/lib/auth";

import AdminLayoutClient from "./_components/AdminLayoutClient";
import SidebarStatsSection from "./_components/SidebarStatsSection";
import SidebarStatsSkeleton from "./_components/SidebarStatsSkeleton";

export const metadata = {
  title: "관리자",
  description: "위스키내비 관리자 페이지",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();

  if (!token) {
    redirect("/sign-in");
  }

  return (
    <main>
      <AdminLayoutClient
        statsSlot={
          <Suspense fallback={<SidebarStatsSkeleton />}>
            <SidebarStatsSection />
          </Suspense>
        }
      >
        {children}
      </AdminLayoutClient>
    </main>
  );
}
