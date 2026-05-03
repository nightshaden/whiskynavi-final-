# Admin Users Search Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/users` 검색창 옆에 필드 선택 dropdown을 추가해서 이름, 사용자명, 이메일 기준으로 검색할 수 있게 만든다.

**Architecture:** 기존 admin 구조를 유지한다. 공용 `AdminHeader`가 검색 UI를 렌더링하므로, users 페이지에서만 사용할 수 있는 optional search filter props를 추가한다. 서버 페이지 `src/app/admin/users/page.tsx`는 URL query를 API `filters.name | filters.username | filters.email`로 매핑하고, 클라이언트 `UsersContent`는 검색어와 검색 대상(field)을 함께 URL에 반영한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Vitest + Testing Library, Tailwind CSS 4, lucide-react, `@/apis/generated/api` Orval client, `overlay-kit`

---

## File Map

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| 공용 admin 검색 헤더 | `src/app/admin/_components/AdminHeader.tsx` | 수정 |
| admin 검색 헤더 테스트 | `src/app/admin/_components/AdminHeader.test.tsx` | 신규 |
| users 서버 fetch/query 매핑 | `src/app/admin/users/page.tsx` | 수정 |
| users 목록 UI/URL 동기화 | `src/app/admin/users/_components/UsersContent.tsx` | 수정 |
| users 목록 테스트 | `src/app/admin/users/_components/UsersContent.test.tsx` | 신규 |

## Search Field Contract

- URL query key: `searchField`
- 허용값: `name`, `username`, `email`
- 기본값: `name`
- 기존 `q` query는 유지
- API 매핑:
  - `searchField=name` -> `filters.name = q`
  - `searchField=username` -> `filters.username = q`
  - `searchField=email` -> `filters.email = q`

---

### Task 1: TDD로 공용 `AdminHeader` 검색 필드 dropdown 지원 추가

**Files:**
- Create: `src/app/admin/_components/AdminHeader.test.tsx`
- Modify: `src/app/admin/_components/AdminHeader.tsx`

- [ ] **Step 1: failing test 작성**

`src/app/admin/_components/AdminHeader.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminHeader from "./AdminHeader";

describe("AdminHeader", () => {
  it("renders search field dropdown with the current option label", () => {
    render(
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={vi.fn()}
        searchQuery="kim"
        searchField="email"
        searchFieldOptions={[
          { value: "name", label: "이름" },
          { value: "username", label: "사용자명" },
          { value: "email", label: "이메일" },
        ]}
        onSearch={vi.fn()}
        onSearchFieldChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "이메일" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("이메일로 검색...")).toHaveValue("kim");
  });

  it("calls onSearchFieldChange when a different field is selected", async () => {
    const user = userEvent.setup();
    const onSearchFieldChange = vi.fn();

    render(
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={vi.fn()}
        searchField="name"
        searchFieldOptions={[
          { value: "name", label: "이름" },
          { value: "username", label: "사용자명" },
          { value: "email", label: "이메일" },
        ]}
        onSearch={vi.fn()}
        onSearchFieldChange={onSearchFieldChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이름" }));
    await user.click(screen.getByRole("button", { name: "사용자명" }));

    expect(onSearchFieldChange).toHaveBeenCalledWith("username");
  });
});
```

- [ ] **Step 2: test 실행해서 실패 확인**

Run:

```bash
pnpm test:run src/app/admin/_components/AdminHeader.test.tsx
```

Expected: `AdminHeader` props에 `searchField`, `searchFieldOptions`, `onSearchFieldChange`가 없어 타입/렌더링 실패.

- [ ] **Step 3: `AdminHeader.tsx` 최소 구현**

`src/app/admin/_components/AdminHeader.tsx`

```typescript
"use client";

import { ChevronDown, Menu, Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

interface SearchFieldOption {
  value: string;
  label: string;
}

interface AdminHeaderProps {
  title: string;
  onToggleSidebar: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  searchField?: string;
  searchFieldOptions?: SearchFieldOption[];
  onSearch?: (value: string) => void;
  onSearchFieldChange?: (value: string) => void;
}

export default function AdminHeader({
  title,
  onToggleSidebar,
  showSearch = true,
  searchQuery = "",
  searchField = "name",
  searchFieldOptions,
  onSearch,
  onSearchFieldChange,
}: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchQuery);

  const currentField = useMemo(
    () => searchFieldOptions?.find((option) => option.value === searchField) ?? null,
    [searchField, searchFieldOptions],
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      startTransition(() => {
        onSearch(value);
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <h2 className="typo-bold-24 text-gray-900">{title}</h2>
          </div>
        </div>

        {showSearch && (
          <div className="flex gap-3">
            {searchFieldOptions && currentField ? (
              <select
                aria-label="검색 기준"
                value={searchField}
                onChange={(e) => onSearchFieldChange?.(e.target.value)}
                className="min-w-32 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {searchFieldOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}

            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={`${currentField?.label ?? "이름"}로 검색...`}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {searchFieldOptions && currentField ? (
                <div className="pointer-events-none absolute top-1/2 right-12 -translate-y-1/2 text-xs text-gray-400 md:hidden">
                  {currentField.label}
                </div>
              ) : null}
              {isPending && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-amber-600"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

Implementation note:

- 위 코드에서 `ChevronDown` import는 사용하지 않으므로 실제 반영 시 제거한다.
- `select`를 먼저 쓰는 이유는 이 작업의 요구사항이 "dropdown UI 추가"이고, 기존 repo에 search-filter 조합용 공용 컴포넌트가 없어서 최소 복잡도로 끝낼 수 있기 때문이다.

- [ ] **Step 4: test 다시 실행해서 pass 확인**

Run:

```bash
pnpm test:run src/app/admin/_components/AdminHeader.test.tsx
```

Expected: `2 passed`

- [ ] **Step 5: commit**

```bash
git add src/app/admin/_components/AdminHeader.tsx \
        src/app/admin/_components/AdminHeader.test.tsx
git commit -m "feat: add search field selector to admin header"
```

---

### Task 2: `/admin/users`에서 `searchField` query를 API filter로 매핑

**Files:**
- Modify: `src/app/admin/users/page.tsx`

- [ ] **Step 1: failing assertion 준비용 코드 변경 전 확인**

현재 `src/app/admin/users/page.tsx`는 아래처럼 `q`를 무조건 `filters.name`으로만 전달한다.

```typescript
filters: {
  pageNumber: params.page ? Number(params.page) - 1 : 0,
  pageSize: params.limit ? Number(params.limit) : 20,
  name: params.q || undefined,
  role: params.role || undefined,
  status: params.status || undefined,
  sortBy: params.sortBy || "createdAt",
  sortDirection: params.sortDirection || "desc",
},
```

- [ ] **Step 2: `page.tsx` 수정**

`src/app/admin/users/page.tsx`

```typescript
import { getApiAdminUsers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import UsersContent from "./_components/UsersContent";

type UserSearchField = "name" | "username" | "email";

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    searchField?: string;
    role?: string;
    navi?: string;
    tales?: string;
    business?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: string;
  }>;
}

const resolveSearchField = (value?: string): UserSearchField => {
  if (value === "username" || value === "email") return value;
  return "name";
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const searchField = resolveSearchField(params.searchField);
  const keyword = params.q || undefined;

  const res = await getApiAdminUsers(
    {
      filters: {
        pageNumber: params.page ? Number(params.page) - 1 : 0,
        pageSize: params.limit ? Number(params.limit) : 20,
        name: searchField === "name" ? keyword : undefined,
        username: searchField === "username" ? keyword : undefined,
        email: searchField === "email" ? keyword : undefined,
        role: params.role || undefined,
        status: params.status || undefined,
        sortBy: params.sortBy || "createdAt",
        sortDirection: params.sortDirection || "desc",
      },
    },
    withToken(token),
  );

  return (
    <UsersContent searchParams={params} users={res.data.content ?? []} totalElements={res.data.totalElements ?? 0} />
  );
}
```

- [ ] **Step 3: typecheck 실행**

Run:

```bash
pnpm exec tsc --noEmit
```

Expected: 에러 없음.

- [ ] **Step 4: commit**

```bash
git add src/app/admin/users/page.tsx
git commit -m "feat: map admin user search field to api filters"
```

---

### Task 3: `UsersContent`에서 dropdown 상태와 검색어를 함께 URL에 반영

**Files:**
- Create: `src/app/admin/users/_components/UsersContent.test.tsx`
- Modify: `src/app/admin/users/_components/UsersContent.tsx`

- [ ] **Step 1: failing test 작성**

`src/app/admin/users/_components/UsersContent.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UsersContent from "./UsersContent";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../_components/AdminLayoutClient", () => ({
  useSidebar: () => ({ toggle: vi.fn() }),
}));

vi.mock("../[userId]/_components/UserDeleteModal", () => ({
  default: () => null,
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

describe("UsersContent", () => {
  it("renders search field selector with current search field", () => {
    render(
      <UsersContent
        searchParams={{ q: "kim", searchField: "username" }}
        users={[]}
        totalElements={0}
      />,
    );

    expect(screen.getByRole("combobox", { name: "검색 기준" })).toHaveValue("username");
    expect(screen.getByPlaceholderText("사용자명로 검색...")).toHaveValue("kim");
  });

  it("keeps q and resets page when the search field changes", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{ q: "kim", searchField: "name", page: "3", status: "ACTIVE" }}
        users={[]}
        totalElements={0}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "검색 기준" }), "email");

    expect(push).toHaveBeenCalledWith("/admin/users?q=kim&searchField=email&page=1&status=ACTIVE");
  });
});
```

- [ ] **Step 2: test 실행해서 실패 확인**

Run:

```bash
pnpm test:run src/app/admin/users/_components/UsersContent.test.tsx
```

Expected: `searchField` prop을 `AdminHeader`에 전달하지 않아 실패.

- [ ] **Step 3: `UsersContent.tsx` 수정**

`src/app/admin/users/_components/UsersContent.tsx`

```typescript
"use client";

import type { AdminUserResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import FilterHeader from "../../_components/FilterHeader";
import Pagination from "../../_components/Pagination";
import { useTableFilter } from "../../_components/useTableFilter";
import { ROLE_COLOR_MAP, ROLE_LABEL_MAP } from "../../constants";
import UserDeleteModal from "../[userId]/_components/UserDeleteModal";

const USER_SEARCH_FIELD_OPTIONS = [
  { value: "name", label: "이름" },
  { value: "username", label: "사용자명" },
  { value: "email", label: "이메일" },
] as const;

type UserSearchField = (typeof USER_SEARCH_FIELD_OPTIONS)[number]["value"];

const resolveSearchField = (value?: string): UserSearchField => {
  if (value === "username" || value === "email") return value;
  return "name";
};

interface UsersContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    searchField?: string;
    role?: string;
    navi?: string;
    tales?: string;
    business?: string;
    status?: string;
    sortBy?: string;
    sortDirection?: string;
  };
  users: AdminUserResponse[];
  totalElements: number;
}

export default function UsersContent({ searchParams, users, totalElements }: UsersContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";
  const searchField = resolveSearchField(searchParams.searchField);

  const { getFilterValue, updateFilter } = useTableFilter({
    searchParams,
    basePath: "/admin/users",
  });

  const buildParams = () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  };

  const handleSearch = (value: string) => {
    const params = buildParams();
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("searchField", searchField);
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSearchFieldChange = (value: string) => {
    const params = buildParams();
    params.set("searchField", resolveSearchField(value));
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={toggle}
        searchQuery={searchQuery}
        searchField={searchField}
        searchFieldOptions={[...USER_SEARCH_FIELD_OPTIONS]}
        onSearch={handleSearch}
        onSearchFieldChange={handleSearchFieldChange}
      />

      {/* 이하 table / pagination 기존 코드 유지 */}
    </>
  );
}
```

Implementation note:

- `handleSearchFieldChange`는 기존 `q` 값을 지우지 않는다. 사용자가 같은 키워드를 다른 필드 기준으로 즉시 재검색하게 만드는 편이 UX에 맞다.
- `navi`, `tales`, `business`는 현재 서버 fetch에서 아직 API filter로 연결되지 않지만, 이번 작업 범위는 검색 기준 확장이므로 기존 동작을 건드리지 않는다.

- [ ] **Step 4: test 다시 실행해서 pass 확인**

Run:

```bash
pnpm test:run src/app/admin/users/_components/UsersContent.test.tsx
```

Expected: `2 passed`

- [ ] **Step 5: users page 관련 회귀 검증**

Run:

```bash
pnpm test:run src/app/admin/_components/AdminHeader.test.tsx src/app/admin/users/_components/UsersContent.test.tsx
pnpm exec tsc --noEmit
pnpm lint
```

Expected:

- Vitest: 신규 테스트 전부 PASS
- TypeScript: 에러 없음
- ESLint: 에러 없음

- [ ] **Step 6: commit**

```bash
git add src/app/admin/users/_components/UsersContent.tsx \
        src/app/admin/users/_components/UsersContent.test.tsx
git commit -m "feat: add search field filter to admin users page"
```

---

## Self-Review

- Spec coverage: 검색 input 옆 dropdown UI, 이름/사용자명/이메일 기준 전환, `/admin/users` query 반영, API filter 분기까지 모두 Task 1-3에 포함했다.
- Placeholder scan: `TBD`, `TODO`, "적절히 처리" 같은 표현 없이 파일 경로, 코드, 명령어를 모두 명시했다.
- Type consistency: `searchField` 허용값은 모든 task에서 `name | username | email`로 통일했다.

Plan complete and saved to `docs/superpowers/plans/2026-05-03-admin-users-search-filter.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
