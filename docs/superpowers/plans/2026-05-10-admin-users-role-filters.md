# Admin Users Role Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/users` 테이블의 회원 유형, 내비, 테일즈, 업장 필터를 canonical URL query인 `role` / `excludedRoles`로 표현하고 API `filters.role` / `filters.excludedRoles`에 그대로 연결한다.

**Architecture:** URL query는 API contract와 같은 `role=<ROLE>` 및 repeated `excludedRoles=<ROLE>`만 사용한다. `src/app/admin/users/filters.ts`는 query normalization, option constants, UI 필터 상태 파생, URLSearchParams builder를 담당하고, 서버 페이지는 normalized canonical query를 API filters로 전달한다. Vercel composition guidance에 따라 필터 상태는 boolean prop 조합이 아니라 explicit variant 값(`all` / `include` / `exclude`)과 순수 함수로 표현한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Orval generated API, Vitest, Testing Library.

---

## 현재 문제 분석

현재 테이블 UI는 `role`, `navi`, `tales`, `business`라는 UI 중심 query를 만들고, 서버 페이지는 `role`만 API filter로 전달한다. 그래서 내비/테일즈/업장 필터 UI를 눌러도 서버 fetch에 반영되지 않는다.

이제 API에 `filters.excludedRoles?: string[]`가 추가되었으므로 URL query 자체를 API contract에 맞춘다.

```text
내비 가입     -> ?role=ROLE_WHISKYNAVI_MEMBER
내비 미가입   -> ?excludedRoles=ROLE_WHISKYNAVI_MEMBER
테일즈 가입   -> ?role=ROLE_WHISKYTALES_MEMBER
테일즈 미가입 -> ?excludedRoles=ROLE_WHISKYTALES_MEMBER
픽업 업장     -> ?role=ROLE_PICK_UP_BUSINESS
일반 회원     -> ?role=ROLE_USER
내비/테일즈 미가입 -> ?excludedRoles=ROLE_WHISKYNAVI_MEMBER&excludedRoles=ROLE_WHISKYTALES_MEMBER
```

Positive role은 API가 하나만 받으므로 `role`은 단일 값이다. Negative role은 여러 개가 가능하므로 `excludedRoles`는 repeated query로 유지한다. UI의 `navi`, `tales`, `business` filter key는 dropdown event 구분용으로만 쓰고 URL에는 저장하지 않는다.

## File Structure

- Create: `src/app/admin/users/filters.ts`
  - 역할: users 페이지 전용 option constants, App Router searchParams normalization, canonical role filter validation, UI currentValue derivation, canonical URL builder.
- Create: `src/app/admin/users/filters.test.ts`
  - 역할: `role` / `excludedRoles` query normalization, API filter mapping, UI currentValue derivation, URL builder 검증.
- Modify: `src/app/admin/users/page.tsx`
  - 역할: raw `searchParams`를 canonical params로 normalize하고 `getApiAdminUsers`에 `role` / `excludedRoles` 전달.
- Modify: `src/app/admin/users/_components/UsersContent.tsx`
  - 역할: local option constants 제거, `filters.ts`의 options/currentValue/builder 사용.
- Modify: `src/app/admin/users/_components/UsersContent.test.tsx`
  - 역할: 기존 검색/정렬 테스트 유지. role filter 상세는 overlay UI 대신 `filters.test.ts`의 순수 함수로 검증.

## Vercel Skill 보강 지침

이 계획을 실행할 때 다음 Vercel skill 기준을 반드시 적용한다.

### `$vercel-composition-patterns`

- `architecture-avoid-boolean-props`: 내비/테일즈 필터를 `isNaviJoined`, `isNaviExcluded` 같은 boolean 조합으로 모델링하지 않는다. dropdown value는 `all` / `include` / `exclude` explicit variant로 유지한다.
- `patterns-explicit-variants`: `NAVI_OPTIONS`와 `TALES_OPTIONS`의 value는 `Y` / `N` 대신 `include` / `exclude`를 사용한다. URL에는 이 UI variant를 저장하지 않고 canonical `role` / `excludedRoles`만 저장한다.
- `state-decouple-implementation`: `FilterHeader`나 `UsersContent`가 role/excludedRoles 조합 규칙을 직접 알지 않게 한다. 조합 규칙은 `filters.ts`의 순수 함수가 소유한다.
- 새 Provider, Context, compound component는 만들지 않는다. 이번 변경은 table filter URL contract 정리이므로 새 추상화보다 작은 순수 모듈이 맞다.

### `$vercel-react-best-practices`

- `server-serialization`: Server Component인 `page.tsx`는 raw App Router `searchParams`를 normalize한 plain object만 `UsersContent`에 넘긴다. 반복 query는 `excludedRoles: string[]`로 정리하고, 알 수 없는 role 문자열은 서버 fetch 전에 제거한다.
- `server-parallel-fetching`: 현재 서버 fetch는 `getAuthToken()` 후 토큰이 필요한 `getApiAdminUsers()` 한 번뿐이므로 추가 병렬화는 하지 않는다. 독립 fetch가 생기기 전까지 `Promise.all`을 도입하지 않는다.
- `bundle-barrel-imports`: `UsersContent.tsx`는 users 전용 `../filters`만 import한다. `src/apis/generated/api.ts`의 큰 타입/상수를 클라이언트 컴포넌트에 새로 import하지 않는다.
- `rerender-dependencies`: client state/effect를 추가하지 않는다. 필터 currentValue는 `searchParams` props에서 바로 파생한다.
- `js-set-map-lookups`: role membership 검사는 module-level readonly arrays 또는 `Set`으로 처리한다. 매 render마다 새 role map을 만들지 않는다.
- `rendering-conditional-render`: 조건부 UI가 필요하면 ternary를 선호하고, 이 작업에서는 table row 렌더링 구조를 불필요하게 재작성하지 않는다.

### `$vercel-react-view-transitions`

- 필터 변경은 같은 admin table 안의 query 업데이트이며 계층 이동이나 공유 element continuity를 표현하지 않는다. 따라서 `<ViewTransition>`을 추가하지 않는다.
- `document.startViewTransition`을 직접 호출하지 않는다.
- 필터 변경 시 table remount를 강제로 만들기 위한 `key={searchParams.toString()}` 패턴을 추가하지 않는다. 데이터 갱신은 App Router navigation과 서버 fetch 흐름에 맡긴다.
- 향후 loading/Suspense UI를 추가할 때만 별도 audit 후 `default="none"` 중심으로 검토한다. 이번 계획 범위에는 transition CSS나 view transition setup이 없다.

## Task 1: Canonical Filter 유틸 추가

**Files:**

- Create: `src/app/admin/users/filters.ts`
- Create: `src/app/admin/users/filters.test.ts`

- [x] **Step 1: failing test 작성**

Create `src/app/admin/users/filters.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  buildAdminUserRoleFilterParams,
  getAdminUserRoleFilterValue,
  isAdminUserRoleFilterKey,
  normalizeAdminUsersSearchParams,
  resolveAdminUsersRoleFilters,
} from "./filters";

describe("admin users canonical role filters", () => {
  it("normalizes repeated excludedRoles query values", () => {
    expect(
      normalizeAdminUsersSearchParams({
        page: ["3", "4"],
        q: ["hong"],
        role: ["ROLE_USER"],
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toMatchObject({
      page: "3",
      q: "hong",
      role: "ROLE_USER",
      excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("passes canonical role and excludedRoles to API filters", () => {
    expect(
      resolveAdminUsersRoleFilters({
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toEqual({
      role: "ROLE_USER",
      excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("drops excludedRoles that conflict with the included role", () => {
    expect(
      resolveAdminUsersRoleFilters({
        role: "ROLE_WHISKYNAVI_MEMBER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      }),
    ).toEqual({
      role: "ROLE_WHISKYNAVI_MEMBER",
      excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
    });
  });

  it("derives navi and tales filter values from canonical query", () => {
    expect(getAdminUserRoleFilterValue({ role: "ROLE_WHISKYNAVI_MEMBER" }, "navi")).toBe("include");
    expect(
      getAdminUserRoleFilterValue({ excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"] }, "navi"),
    ).toBe("exclude");
    expect(getAdminUserRoleFilterValue({ excludedRoles: ["ROLE_WHISKYTALES_MEMBER"] }, "tales")).toBe("exclude");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_USER" }, "tales")).toBe("all");
  });

  it("derives member type and business filter values from canonical role", () => {
    expect(getAdminUserRoleFilterValue({ role: "ROLE_USER" }, "role")).toBe("ROLE_USER");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_PICK_UP_BUSINESS" }, "business")).toBe("ROLE_PICK_UP_BUSINESS");
    expect(getAdminUserRoleFilterValue({ role: "ROLE_PICK_UP_BUSINESS" }, "role")).toBe("all");
  });

  it("selects navi include by setting role and clearing the same excludedRole", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
      },
      "navi",
      "include",
    );

    expect(params.toString()).toBe("page=1&role=ROLE_WHISKYNAVI_MEMBER&excludedRoles=ROLE_WHISKYTALES_MEMBER");
  });

  it("selects navi exclude by appending excludedRoles without removing unrelated role", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
      },
      "navi",
      "exclude",
    );

    expect(params.toString()).toBe(
      "page=1&role=ROLE_USER&excludedRoles=ROLE_WHISKYTALES_MEMBER&excludedRoles=ROLE_WHISKYNAVI_MEMBER",
    );
  });

  it("clears navi filter by removing matching role or excludedRole", () => {
    expect(
      buildAdminUserRoleFilterParams(
        {
          page: "5",
          role: "ROLE_WHISKYNAVI_MEMBER",
          excludedRoles: ["ROLE_WHISKYTALES_MEMBER"],
        },
        "navi",
        "all",
      ).toString(),
    ).toBe("page=1&excludedRoles=ROLE_WHISKYTALES_MEMBER");

    expect(
      buildAdminUserRoleFilterParams(
        {
          page: "5",
          role: "ROLE_USER",
          excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
        },
        "navi",
        "all",
      ).toString(),
    ).toBe("page=1&role=ROLE_USER&excludedRoles=ROLE_WHISKYTALES_MEMBER");
  });

  it("selects a business role through the same canonical role query", () => {
    const params = buildAdminUserRoleFilterParams(
      {
        page: "5",
        role: "ROLE_USER",
        excludedRoles: ["ROLE_WHISKYNAVI_MEMBER"],
      },
      "business",
      "ROLE_PICK_UP_BUSINESS",
    );

    expect(params.toString()).toBe("page=1&role=ROLE_PICK_UP_BUSINESS&excludedRoles=ROLE_WHISKYNAVI_MEMBER");
  });

  it("recognizes only supported UI role filter keys", () => {
    expect(isAdminUserRoleFilterKey("role")).toBe(true);
    expect(isAdminUserRoleFilterKey("navi")).toBe(true);
    expect(isAdminUserRoleFilterKey("tales")).toBe(true);
    expect(isAdminUserRoleFilterKey("business")).toBe(true);
    expect(isAdminUserRoleFilterKey("status")).toBe(false);
  });
});
```

- [x] **Step 2: test 실행해서 실패 확인**

Run:

```bash
pnpm test:run src/app/admin/users/filters.test.ts
```

Expected: `Cannot find module './filters'` 실패.

- [x] **Step 3: implementation 작성**

Create `src/app/admin/users/filters.ts`:

```typescript
export const USER_SEARCH_FIELD_OPTIONS = [
  { value: "name", label: "이름" },
  { value: "username", label: "사용자명" },
  { value: "email", label: "이메일" },
] as const;

export type UserSearchField = (typeof USER_SEARCH_FIELD_OPTIONS)[number]["value"];

export const ADMIN_USER_ROLES = {
  SUPER_ADMIN: "ROLE_SUPER_ADMIN",
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  WHISKYNAVI_MEMBER: "ROLE_WHISKYNAVI_MEMBER",
  WHISKYTALES_MEMBER: "ROLE_WHISKYTALES_MEMBER",
  TRAILNTALE_BUSINESS: "ROLE_TRAILNTALE_BUSINESS",
  COMMUNITY_BUSINESS: "ROLE_COMMUNITY_BUSINESS",
  PICK_UP_BUSINESS: "ROLE_PICK_UP_BUSINESS",
} as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[keyof typeof ADMIN_USER_ROLES];

export const ROLE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: ADMIN_USER_ROLES.SUPER_ADMIN, label: "총괄 관리자" },
  { value: ADMIN_USER_ROLES.ADMIN, label: "관리자" },
  { value: ADMIN_USER_ROLES.USER, label: "일반 회원" },
] as const;

export const NAVI_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "include", label: "가입" },
  { value: "exclude", label: "미가입" },
] as const;

export const TALES_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "include", label: "가입" },
  { value: "exclude", label: "미가입" },
] as const;

export const BUSINESS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: ADMIN_USER_ROLES.TRAILNTALE_BUSINESS, label: "트레일테일" },
  { value: ADMIN_USER_ROLES.COMMUNITY_BUSINESS, label: "커뮤니티" },
  { value: ADMIN_USER_ROLES.PICK_UP_BUSINESS, label: "픽업" },
] as const;

export const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "ACTIVE", label: "활성" },
  { value: "INACTIVE", label: "비활성" },
] as const;

export type AdminUsersSearchParams = {
  page?: string;
  limit?: string;
  q?: string;
  searchField?: string;
  role?: string;
  excludedRoles?: string[];
  status?: string;
  sortBy?: string;
  sortDirection?: string;
};

export type AdminUsersRawSearchParams = Omit<
  {
    [Key in keyof AdminUsersSearchParams]?: string | string[];
  },
  "excludedRoles"
> & {
  excludedRoles?: string | string[];
};

const ROLE_FILTER_KEYS = ["role", "navi", "tales", "business"] as const;

export type AdminUserRoleFilterKey = (typeof ROLE_FILTER_KEYS)[number];
const MEMBER_ROLE_VALUES = ROLE_OPTIONS.filter((option) => option.value !== "all").map((option) => option.value);
const BUSINESS_ROLE_VALUES = BUSINESS_OPTIONS.filter((option) => option.value !== "all").map((option) => option.value);
const ADMIN_USER_ROLE_VALUES = [
  ...MEMBER_ROLE_VALUES,
  ADMIN_USER_ROLES.WHISKYNAVI_MEMBER,
  ADMIN_USER_ROLES.WHISKYTALES_MEMBER,
  ...BUSINESS_ROLE_VALUES,
];

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function arrayQueryValue(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function isKnownRole(value: string): value is AdminUserRole {
  return ADMIN_USER_ROLE_VALUES.includes(value as AdminUserRole);
}

export function isAdminUserRoleFilterKey(key: string): key is AdminUserRoleFilterKey {
  return ROLE_FILTER_KEYS.includes(key as AdminUserRoleFilterKey);
}

function normalizeRole(value: string | undefined): string | undefined {
  return value && isKnownRole(value) ? value : undefined;
}

function normalizeExcludedRoles(values: string[], role?: string): string[] | undefined {
  const excludedRoles = uniqueValues(values).filter((value) => isKnownRole(value) && value !== role);
  return excludedRoles.length > 0 ? excludedRoles : undefined;
}

function removeExcludedRole(values: string[] | undefined, role: string): string[] | undefined {
  return normalizeExcludedRoles((values ?? []).filter((value) => value !== role));
}

function addExcludedRole(values: string[] | undefined, role: string): string[] {
  return normalizeExcludedRoles([...(values ?? []), role]) ?? [];
}

export function resolveSearchField(value?: string): UserSearchField {
  if (value === "username" || value === "email") {
    return value;
  }

  return "name";
}

export function normalizeAdminUsersSearchParams(params: AdminUsersRawSearchParams): AdminUsersSearchParams {
  const role = normalizeRole(firstQueryValue(params.role));

  return {
    page: firstQueryValue(params.page),
    limit: firstQueryValue(params.limit),
    q: firstQueryValue(params.q),
    searchField: firstQueryValue(params.searchField),
    role,
    excludedRoles: normalizeExcludedRoles(arrayQueryValue(params.excludedRoles), role),
    status: firstQueryValue(params.status),
    sortBy: firstQueryValue(params.sortBy),
    sortDirection: firstQueryValue(params.sortDirection),
  };
}

export function resolveAdminUsersRoleFilters(params: AdminUsersSearchParams): {
  role?: string;
  excludedRoles?: string[];
} {
  const role = normalizeRole(params.role);

  return {
    role,
    excludedRoles: normalizeExcludedRoles(params.excludedRoles ?? [], role),
  };
}

export function getAdminUserRoleFilterValue(params: AdminUsersSearchParams, key: AdminUserRoleFilterKey): string {
  if (key === "role") {
    return params.role && MEMBER_ROLE_VALUES.includes(params.role) ? params.role : "all";
  }

  if (key === "business") {
    return params.role && BUSINESS_ROLE_VALUES.includes(params.role) ? params.role : "all";
  }

  const role = key === "navi" ? ADMIN_USER_ROLES.WHISKYNAVI_MEMBER : ADMIN_USER_ROLES.WHISKYTALES_MEMBER;

  if (params.role === role) {
    return "include";
  }

  if (params.excludedRoles?.includes(role)) {
    return "exclude";
  }

  return "all";
}

function setPositiveRole(params: AdminUsersSearchParams, role: string): AdminUsersSearchParams {
  return {
    ...params,
    role,
    excludedRoles: removeExcludedRole(params.excludedRoles, role),
  };
}

function clearRoleIfIn(params: AdminUsersSearchParams, roles: readonly string[]): AdminUsersSearchParams {
  if (!params.role || !roles.includes(params.role)) {
    return params;
  }

  return {
    ...params,
    role: undefined,
  };
}

function toUrlSearchParams(params: AdminUsersSearchParams): URLSearchParams {
  const urlParams = new URLSearchParams();

  if (params.page) urlParams.set("page", params.page);
  if (params.limit) urlParams.set("limit", params.limit);
  if (params.q) urlParams.set("q", params.q);
  if (params.searchField) urlParams.set("searchField", params.searchField);
  if (params.role) urlParams.set("role", params.role);
  params.excludedRoles?.forEach((role) => urlParams.append("excludedRoles", role));
  if (params.status) urlParams.set("status", params.status);
  if (params.sortBy) urlParams.set("sortBy", params.sortBy);
  if (params.sortDirection) urlParams.set("sortDirection", params.sortDirection);

  return urlParams;
}

export function buildAdminUserRoleFilterParams(
  searchParams: AdminUsersSearchParams,
  key: AdminUserRoleFilterKey,
  value: string,
): URLSearchParams {
  let nextParams: AdminUsersSearchParams = {
    ...searchParams,
    page: "1",
    excludedRoles: searchParams.excludedRoles ? [...searchParams.excludedRoles] : undefined,
  };

  if (key === "role") {
    nextParams = value === "all" ? clearRoleIfIn(nextParams, MEMBER_ROLE_VALUES) : setPositiveRole(nextParams, value);
  }

  if (key === "business") {
    nextParams = value === "all" ? clearRoleIfIn(nextParams, BUSINESS_ROLE_VALUES) : setPositiveRole(nextParams, value);
  }

  if (key === "navi" || key === "tales") {
    const role = key === "navi" ? ADMIN_USER_ROLES.WHISKYNAVI_MEMBER : ADMIN_USER_ROLES.WHISKYTALES_MEMBER;

    if (value === "include") {
      nextParams = setPositiveRole(nextParams, role);
    }

    if (value === "exclude") {
      nextParams = {
        ...clearRoleIfIn(nextParams, [role]),
        excludedRoles: addExcludedRole(nextParams.excludedRoles, role),
      };
    }

    if (value === "all") {
      nextParams = {
        ...clearRoleIfIn(nextParams, [role]),
        excludedRoles: removeExcludedRole(nextParams.excludedRoles, role),
      };
    }
  }

  const roleFilters = resolveAdminUsersRoleFilters(nextParams);
  return toUrlSearchParams({
    ...nextParams,
    role: roleFilters.role,
    excludedRoles: roleFilters.excludedRoles,
  });
}
```

- [x] **Step 4: test 통과 확인**

Run:

```bash
pnpm test:run src/app/admin/users/filters.test.ts
```

Expected: `1 passed` test file, `10 passed` tests.

- [ ] **Step 5: commit**

```bash
git add src/app/admin/users/filters.ts src/app/admin/users/filters.test.ts
git commit -m "feat: add canonical admin user role filters"
```

## Task 2: 서버 페이지에서 Canonical Query를 API Filter로 전달

**Files:**

- Modify: `src/app/admin/users/page.tsx`
- Test: `src/app/admin/users/filters.test.ts`

- [x] **Step 1: `page.tsx` 수정**

Replace `src/app/admin/users/page.tsx` with:

```typescript
import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import {
  normalizeAdminUsersSearchParams,
  resolveAdminUsersRoleFilters,
  resolveSearchField,
  type AdminUsersRawSearchParams,
} from "./filters";
import UsersContent from "./_components/UsersContent";

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
```

- [x] **Step 2: resolver test 재실행**

Run:

```bash
pnpm test:run src/app/admin/users/filters.test.ts
```

Expected: `1 passed` test file, `10 passed` tests.

- [x] **Step 3: changed file lint 실행**

Run:

```bash
pnpm exec eslint src/app/admin/users/page.tsx src/app/admin/users/filters.ts src/app/admin/users/filters.test.ts
```

Expected: no lint errors for changed files.

- [ ] **Step 4: commit**

```bash
git add src/app/admin/users/page.tsx
git commit -m "feat: pass admin user excluded roles to api"
```

## Task 3: UsersContent에서 Canonical Query Builder 사용

**Files:**

- Modify: `src/app/admin/users/_components/UsersContent.tsx`
- Test: `src/app/admin/users/_components/UsersContent.test.tsx`
- Test: `src/app/admin/users/filters.test.ts`

- [x] **Step 1: import와 props type 변경**

In `src/app/admin/users/_components/UsersContent.tsx`, remove local `USER_SEARCH_FIELD_OPTIONS`, `UserSearchField`, `resolveSearchField`, `ROLE_OPTIONS`, `NAVI_OPTIONS`, `TALES_OPTIONS`, `BUSINESS_OPTIONS`, `STATUS_OPTIONS`.

Add:

```typescript
import {
  BUSINESS_OPTIONS,
  NAVI_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  TALES_OPTIONS,
  USER_SEARCH_FIELD_OPTIONS,
  buildAdminUserRoleFilterParams,
  getAdminUserRoleFilterValue,
  isAdminUserRoleFilterKey,
  resolveSearchField,
  type AdminUsersSearchParams,
} from "../filters";
```

Then update props:

```typescript
interface UsersContentProps {
  searchParams: AdminUsersSearchParams;
  users: AdminUserResponse[];
  totalElements: number;
}
```

- [x] **Step 2: role filter handler 추가**

Add this handler after `handleSearchFieldChange`:

```typescript
const handleRoleFilterSelect = (key: string, value: string) => {
  if (!isAdminUserRoleFilterKey(key)) {
    return;
  }

  const params = buildAdminUserRoleFilterParams(searchParams, key, value);
  router.push(`/admin/users?${params.toString()}`);
};
```

- [x] **Step 3: role 계열 FilterHeader currentValue/onSelect 교체**

Use derived current values and the canonical builder for role-related filters:

```tsx
                  <FilterHeader
                    label="회원 유형"
                    filterKey="role"
                    options={[...ROLE_OPTIONS]}
                    currentValue={getAdminUserRoleFilterValue(searchParams, "role")}
                    onSelect={handleRoleFilterSelect}
                    dropdownWidth="w-40"
                  />
                  <FilterHeader
                    label="내비"
                    filterKey="navi"
                    options={[...NAVI_OPTIONS]}
                    currentValue={getAdminUserRoleFilterValue(searchParams, "navi")}
                    onSelect={handleRoleFilterSelect}
                    iconSize={10}
                    dropdownWidth="w-28"
                    className="typo-bold-10 w-20 px-2 py-2 text-left text-gray-700 uppercase"
                  />
                  <FilterHeader
                    label="테일즈"
                    filterKey="tales"
                    options={[...TALES_OPTIONS]}
                    currentValue={getAdminUserRoleFilterValue(searchParams, "tales")}
                    onSelect={handleRoleFilterSelect}
                    iconSize={10}
                    dropdownWidth="w-28"
                    className="typo-bold-10 w-20 px-2 py-2 text-left text-gray-700 uppercase"
                  />
                  <FilterHeader
                    label="업장"
                    filterKey="business"
                    options={[...BUSINESS_OPTIONS]}
                    currentValue={getAdminUserRoleFilterValue(searchParams, "business")}
                    onSelect={handleRoleFilterSelect}
                  />
                  <FilterHeader
                    label="상태"
                    filterKey="status"
                    options={[...STATUS_OPTIONS]}
                    currentValue={getFilterValue("status")}
                    onSelect={updateFilter}
                    dropdownWidth="w-32"
                  />
```

- [x] **Step 4: tests 실행**

Run:

```bash
pnpm test:run src/app/admin/users/_components/UsersContent.test.tsx src/app/admin/users/filters.test.ts
```

Expected: `2 passed` test files. `UsersContent.test.tsx`는 기존 6개 테스트가 통과하고 `filters.test.ts`는 10개 테스트가 통과한다.

- [ ] **Step 5: commit**

```bash
git add src/app/admin/users/_components/UsersContent.tsx
git commit -m "feat: use canonical admin user role filter query"
```

## Task 4: 검증 및 정리

**Files:**

- Verify: `src/app/admin/users/filters.ts`
- Verify: `src/app/admin/users/filters.test.ts`
- Verify: `src/app/admin/users/page.tsx`
- Verify: `src/app/admin/users/_components/UsersContent.tsx`
- Verify: `src/app/admin/users/_components/UsersContent.test.tsx`

- [x] **Step 1: targeted tests 실행**

Run:

```bash
pnpm test:run src/app/admin/users/filters.test.ts src/app/admin/users/_components/UsersContent.test.tsx
```

Expected: both test files pass.

- [x] **Step 2: changed files lint 실행**

Run:

```bash
pnpm exec eslint src/app/admin/users/filters.ts src/app/admin/users/filters.test.ts src/app/admin/users/page.tsx src/app/admin/users/_components/UsersContent.tsx src/app/admin/users/_components/UsersContent.test.tsx
```

Expected: no lint errors for changed files.

- [x] **Step 2-1: Vercel skill regression scan**

Run:

```bash
rg -n "ViewTransition|startViewTransition|navi=|tales=|business=" src/app/admin/users
```

Expected: no `ViewTransition` / `startViewTransition` matches, and no URL-building code that emits `navi=`, `tales=`, or `business=` query params. The strings may still appear only as UI filter keys or test names if they do not become URL query output.

- [x] **Step 3: format check 실행**

Run:

```bash
pnpm exec prettier --check src/app/admin/users/filters.ts src/app/admin/users/filters.test.ts src/app/admin/users/page.tsx src/app/admin/users/_components/UsersContent.tsx src/app/admin/users/_components/UsersContent.test.tsx
```

Expected: all matched files use Prettier code style.

- [x] **Step 4: full checks 실행 및 기존 실패 기록**

Run:

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
```

Expected: `pnpm lint` may still fail on existing unrelated files such as `DateTimePicker.tsx`, `AdminProductTable.tsx`, `AdminUserDetailSection.tsx`, and React compiler lint rules. `pnpm exec tsc --noEmit --pretty false` may still fail on existing `.next/types/validator.ts` generated reference to missing `src/app/api/extract-bottle-fields/route.js`. Do not fix unrelated failures in this task.

- [ ] **Step 5: final commit**

```bash
git add src/app/admin/users/filters.ts src/app/admin/users/filters.test.ts src/app/admin/users/page.tsx src/app/admin/users/_components/UsersContent.tsx src/app/admin/users/_components/UsersContent.test.tsx
git commit -m "feat: support admin user excluded role filters"
```

## Self-Review

- Spec coverage: 가입 is represented as canonical `role`; 미가입 is represented as canonical repeated `excludedRoles`; `all` removes the matching role/excluded role; business and member type filters use the same `role` query; status remains `status`; search/sort behavior is preserved.
- Vercel skill coverage: explicit variants avoid boolean prop proliferation; server page normalizes and serializes only plain params; client code adds no effects/state and no View Transition behavior for same-table filtering.
- Placeholder scan: no `TBD`, no vague "handle edge cases", no references to undefined functions.
- Type consistency: `AdminUsersRawSearchParams` handles App Router repeated query values; `AdminUsersSearchParams` stores `excludedRoles` as `string[]`; `buildAdminUserRoleFilterParams` accepts UI filter keys but emits only canonical URL query.
