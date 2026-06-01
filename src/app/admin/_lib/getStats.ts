import { cache } from "react";

import {
  getApiAdminBottles,
  getApiAdminBottlesReservationsApplications,
  getApiAdminBottlesReservationsNotices,
  getApiAdminBusinessesMembers,
  getApiAdminOrders,
  getApiAdminUsers,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";

export type SidebarStats = {
  totalUsers: number | null;
  totalOrders: number | null;
  totalBottles: number | null;
  totalNotices: number | null;
  totalApplications: number | null;
  totalBusinessMembers: number | null;
};

export const getStats = cache(async (): Promise<SidebarStats> => {
  const token = await getAuthToken();
  const opts = withToken(token);

  const [users, orders, bottles, notices, applications, businessMembers] = await Promise.allSettled([
    getApiAdminUsers({ size: 1 }, opts),
    getApiAdminOrders({ size: 1 }, opts),
    getApiAdminBottles({ size: 1 }, opts),
    getApiAdminBottlesReservationsNotices({ size: 1 }, opts),
    getApiAdminBottlesReservationsApplications({ size: 1 }, opts),
    getApiAdminBusinessesMembers({ size: 1 }, opts),
  ]);

  return {
    totalUsers: users.status === "fulfilled" ? (users.value.data?.page?.totalElements ?? null) : null,
    totalOrders: orders.status === "fulfilled" ? (orders.value.data?.page?.totalElements ?? null) : null,
    totalBottles: bottles.status === "fulfilled" ? (bottles.value.data?.page?.totalElements ?? null) : null,
    totalNotices: notices.status === "fulfilled" ? (notices.value.data?.page?.totalElements ?? null) : null,
    totalApplications:
      applications.status === "fulfilled" ? (applications.value.data?.page?.totalElements ?? null) : null,
    totalBusinessMembers:
      businessMembers.status === "fulfilled" ? (businessMembers.value.data?.page?.totalElements ?? null) : null,
  };
});
