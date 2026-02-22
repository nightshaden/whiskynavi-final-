import { redirect } from "next/navigation";

import { getAuthToken } from "@/lib/auth";
import { withToken } from "@/apis/mutator";
import {
  getApiAdminUsers,
  getApiAdminOrders,
  getApiAdminBottles,
  getApiAdminBottlesReservationsNotices,
  getApiAdminBottlesReservationsApplications,
  getApiAdminBusinessesMembers,
} from "@/apis/generated/api";

import AdminLayoutClient from "./_components/AdminLayoutClient";

export type SidebarStats = {
  totalUsers: number | null;
  totalOrders: number | null;
  totalBottles: number | null;
  totalNotices: number | null;
  totalApplications: number | null;
  totalBusinessMembers: number | null;
};

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

  const opts = withToken(token);

  const [users, orders, bottles, notices, applications, businessMembers] =
    await Promise.allSettled([
      getApiAdminUsers({ filters: { pageSize: 1 } }, opts),
      getApiAdminOrders({ size: 1 }, opts),
      getApiAdminBottles({ filters: { pageSize: 1 } }, opts),
      getApiAdminBottlesReservationsNotices({ size: 1 }, opts),
      getApiAdminBottlesReservationsApplications({ size: 1 }, opts),
      getApiAdminBusinessesMembers({ size: 1 }, opts),
    ]);

  const stats: SidebarStats = {
    totalUsers:
      users.status === "fulfilled"
        ? (users.value.data?.totalElements ?? null)
        : null,
    totalOrders:
      orders.status === "fulfilled"
        ? (orders.value.data?.totalElements ?? null)
        : null,
    totalBottles:
      bottles.status === "fulfilled"
        ? (bottles.value.data?.totalElements ?? null)
        : null,
    totalNotices:
      notices.status === "fulfilled"
        ? (notices.value.data?.totalElements ?? null)
        : null,
    totalApplications:
      applications.status === "fulfilled"
        ? (applications.value.data?.totalElements ?? null)
        : null,
    totalBusinessMembers:
      businessMembers.status === "fulfilled"
        ? (businessMembers.value.data?.totalElements ?? null)
        : null,
  };

  return (
    <main>
      <AdminLayoutClient stats={stats}>{children}</AdminLayoutClient>
    </main>
  );
}
