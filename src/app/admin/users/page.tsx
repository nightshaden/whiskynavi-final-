import { getApiAdminUsers, ItemReservationGradeConditionResponseRequiredRole } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import UsersContent from "./_components/UsersContent";

const USER_SEARCH_FIELDS = ["name", "username", "email"] as const;

type UserSearchField = (typeof USER_SEARCH_FIELDS)[number];

function resolveSearchField(searchField?: string): UserSearchField {
  return USER_SEARCH_FIELDS.find((field) => field === searchField) ?? "name";
}

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    searchField?: string;
    role?: ItemReservationGradeConditionResponseRequiredRole;
    navi?: string;
    tales?: string;
    business?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const searchField = resolveSearchField(params.searchField);
  const keyword = params.q || undefined;

  const filters = {
    pageNumber: params.page ? Number(params.page) - 1 : 0,
    pageSize: params.limit ? Number(params.limit) : 20,
    name: searchField === "name" ? keyword : undefined,
    username: searchField === "username" ? keyword : undefined,
    email: searchField === "email" ? keyword : undefined,
    role: params.role || undefined,
    status: params.status || undefined,
    sortBy: params.sortBy || "createdAt",
    sortDirection: params.sortDirection || "desc",
  };

  const res = await getApiAdminUsers({ filters }, withToken(token));

  return (
    <UsersContent searchParams={params} users={res.data.content ?? []} totalElements={res.data.totalElements ?? 0} />
  );
}
