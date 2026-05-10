import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import UsersContent from "./_components/UsersContent";
import {
  normalizeAdminUsersSearchParams,
  resolveAdminUsersRoleFilters,
  resolveSearchField,
  type AdminUsersRawSearchParams,
} from "./filters";

interface UsersPageProps {
  searchParams: Promise<AdminUsersRawSearchParams>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const rawParams = await searchParams;
  const params = normalizeAdminUsersSearchParams(rawParams);
  const token = await getAuthToken();
  const searchField = resolveSearchField(params.searchField);
  const keyword = params.q || undefined;
  const roleFilters = resolveAdminUsersRoleFilters(params);

  const filters = {
    pageNumber: params.page ? Number(params.page) - 1 : 0,
    pageSize: params.limit ? Number(params.limit) : 20,
    name: searchField === "name" ? keyword : undefined,
    username: searchField === "username" ? keyword : undefined,
    email: searchField === "email" ? keyword : undefined,
    role: roleFilters.role,
    excludedRoles: roleFilters.excludedRoles,
    status: params.status || undefined,
    sortBy: params.sortBy || "createdAt",
    sortDirection: params.sortDirection || "desc",
  };

  const res = await getApiAdminUsers({ filters }, withToken(token));

  return (
    <UsersContent searchParams={params} users={res.data.content ?? []} totalElements={res.data.totalElements ?? 0} />
  );
}
