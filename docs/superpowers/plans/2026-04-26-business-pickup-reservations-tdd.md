# Business Pickup Reservations Pages (TDD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/app/business/pickup-reservations` 리스트 페이지와 `[applicationId]` 상세 페이지를 TDD로 생성한다.

**Architecture:** Vitest + @testing-library/react로 클라이언트 컴포넌트 테스트 먼저 작성 → 구현 → 검증. RSC `page.tsx`는 데이터 페칭만 담당, 클라이언트 `_components/`가 UI 렌더링. `business/layout.tsx`에서 인증 체크. Admin 섹션과 독립적인 심플한 레이아웃(sidebar 없음).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Vitest + @testing-library/react + happy-dom, Tailwind CSS 4, shadcn/ui Badge, lucide-react, `@/apis/generated/api` (Orval), `getAuthToken()` + `withToken()`, `FilterHeader` + `useTableFilter` (from `@/app/admin/_components/`)

---

## File Map

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| Vitest 설정 | `vitest.config.ts` | 신규 |
| Vitest global setup | `vitest.setup.ts` | 신규 |
| test 스크립트 추가 | `package.json` | 수정 |
| Business 레이아웃 RSC | `src/app/business/layout.tsx` | 신규 |
| Business 헤더 클라이언트 | `src/app/business/_components/BusinessHeader.tsx` | 신규 |
| Business 공유 상수 | `src/app/business/constants.ts` | 신규 |
| 리스트 클라이언트 컴포넌트 | `src/app/business/pickup-reservations/_components/PickupReservationsContent.tsx` | 신규 |
| 리스트 컴포넌트 테스트 | `src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx` | 신규 |
| 리스트 RSC | `src/app/business/pickup-reservations/page.tsx` | 신규 |
| 상세 클라이언트 컴포넌트 | `src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx` | 신규 |
| 상세 컴포넌트 테스트 | `src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.test.tsx` | 신규 |
| 상세 RSC | `src/app/business/pickup-reservations/[applicationId]/page.tsx` | 신규 |

---

## Task 1: Vitest 테스트 인프라 세팅

이 프로젝트에는 테스트 인프라가 없다. Vitest + @testing-library/react를 설치하고 설정한다.

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`

- [ ] **Step 1: 패키지 설치**

```bash
cd /Users/morrison.k/Documents/study/app-router-with-claude
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

Expected: `pnpm-lock.yaml` 업데이트, 에러 없음.

- [ ] **Step 2: vitest.config.ts 생성**

```typescript
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: vitest.setup.ts 생성**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 4: package.json에 test 스크립트 추가**

`"scripts"` 섹션에 다음을 추가한다 (`"lint"` 항목 바로 아래):

```json
"test": "vitest",
"test:run": "vitest run",
```

결과 (`"scripts"` 섹션 일부):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest",
  "test:run": "vitest run",
  "format": "prettier --write .",
  ...
}
```

- [ ] **Step 5: Vitest가 동작하는지 확인 (smoke test)**

임시 테스트 파일을 생성하여 Vitest가 실행되는지 확인한다:

```bash
echo 'import { describe, expect, it } from "vitest";
describe("vitest", () => {
  it("works", () => expect(1 + 1).toBe(2));
});' > src/vitest-smoke.test.ts
```

```bash
pnpm test:run 2>&1 | tail -10
```

Expected: `✓ src/vitest-smoke.test.ts (1)` 포함, 실패 없음.

임시 파일 삭제:
```bash
rm src/vitest-smoke.test.ts
```

- [ ] **Step 6: 커밋**

```bash
git add vitest.config.ts vitest.setup.ts package.json pnpm-lock.yaml
git commit -m "chore: setup Vitest + @testing-library/react"
```

---

## Task 2: Business 레이아웃 및 공유 상수

**Files:**
- Create: `src/app/business/layout.tsx`
- Create: `src/app/business/_components/BusinessHeader.tsx`
- Create: `src/app/business/constants.ts`

- [ ] **Step 1: `src/app/business/constants.ts` 생성**

예약 상태 라벨/색상 상수. Admin의 `constants.ts`와 독립적으로 관리한다.

```typescript
export const PICKUP_STATUS_LABEL: Record<string, string> = {
  APPLIED: "신청완료",
  CONFIRMED: "확정",
  PAYMENT_COMPLETED: "결제완료",
  WAITING_PICKUP: "픽업대기",
  RECEIVED: "수령완료",
  CANCELLED: "취소",
  REJECTED: "거절",
};

export const PICKUP_STATUS_COLOR: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PAYMENT_COMPLETED: "bg-cyan-100 text-cyan-700",
  WAITING_PICKUP: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-gray-200 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
};

export const PICKUP_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "APPLIED", label: "신청완료" },
  { value: "CONFIRMED", label: "확정" },
  { value: "PAYMENT_COMPLETED", label: "결제완료" },
  { value: "WAITING_PICKUP", label: "픽업대기" },
  { value: "RECEIVED", label: "수령완료" },
  { value: "CANCELLED", label: "취소" },
  { value: "REJECTED", label: "거절" },
] as const;
```

- [ ] **Step 2: `src/app/business/_components/BusinessHeader.tsx` 생성**

사이드바 없는 심플한 헤더:

```typescript
"use client";

interface BusinessHeaderProps {
  title: string;
}

export default function BusinessHeader({ title }: BusinessHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}
```

- [ ] **Step 3: `src/app/business/layout.tsx` 생성**

인증만 체크하는 RSC 레이아웃. 세션이 없으면 로그인 페이지로 리디렉션:

```typescript
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "픽업 사업장",
  description: "픽업 예약 관리",
};

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}
```

- [ ] **Step 4: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/app/business/layout.tsx \
        src/app/business/_components/BusinessHeader.tsx \
        src/app/business/constants.ts
git commit -m "feat: add business layout, header, and pickup status constants"
```

---

## Task 3: TDD — PickupReservationsContent (리스트 UI)

TDD 순서: 테스트 먼저 작성 → 실패 확인 → 구현 → 통과 확인.

**Files:**
- Create: `src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx`
- Create: `src/app/business/pickup-reservations/_components/PickupReservationsContent.tsx`

### 3-1: 테스트 먼저 작성

- [ ] **Step 1: 테스트 파일 작성**

`src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PickupReservationsContent from "./PickupReservationsContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const searchParams = {};

describe("PickupReservationsContent", () => {
  it("shows empty state when no applications", () => {
    render(
      <PickupReservationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={0}
      />,
    );
    expect(
      screen.getByText("픽업 예약 신청이 없습니다."),
    ).toBeInTheDocument();
  });

  it("shows total count", () => {
    render(
      <PickupReservationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={42}
      />,
    );
    expect(screen.getByText("총 42건")).toBeInTheDocument();
  });

  it("renders application row with bottle name and applicant", () => {
    const mockApp = {
      id: 1,
      bottleName: "Glen 12",
      applicantUser: { name: "김철수", nickname: "glen_lover", email: "kim@test.com", phone: "010-0000-0000" },
      quantity: 2,
      confirmedQuantity: 1,
      status: "APPLIED" as const,
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      bottleId: 5,
      noticeId: 10,
      bottleImgUrl: undefined,
    };

    render(
      <PickupReservationsContent
        searchParams={searchParams}
        applications={[mockApp]}
        totalElements={1}
      />,
    );

    expect(screen.getByText("Glen 12")).toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.getByText("신청완료")).toBeInTheDocument();
  });

  it("renders status badge with correct label for WAITING_PICKUP", () => {
    const mockApp = {
      id: 2,
      bottleName: "Yamazaki",
      applicantUser: { name: "이영희", nickname: "y", email: "lee@test.com", phone: "010-1111-2222" },
      quantity: 1,
      confirmedQuantity: 1,
      status: "WAITING_PICKUP" as const,
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-02-01T00:00:00Z",
      bottleId: 6,
      noticeId: 11,
      bottleImgUrl: undefined,
    };

    render(
      <PickupReservationsContent
        searchParams={searchParams}
        applications={[mockApp]}
        totalElements={1}
      />,
    );

    expect(screen.getByText("픽업대기")).toBeInTheDocument();
  });

  it("renders page title", () => {
    render(
      <PickupReservationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={0}
      />,
    );
    expect(screen.getByText("픽업 예약 관리")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -20
```

Expected: `Cannot find module './PickupReservationsContent'` 또는 컴파일 에러. **반드시 실패해야 한다.**

### 3-2: 구현

- [ ] **Step 3: `PickupReservationsContent.tsx` 구현**

`src/app/business/pickup-reservations/_components/PickupReservationsContent.tsx`:

```typescript
"use client";

import type { BottleReservationPickupApplicationResponse } from "@/apis/generated/api";
import FilterHeader from "@/app/admin/_components/FilterHeader";
import Pagination from "@/app/admin/_components/Pagination";
import { useTableFilter } from "@/app/admin/_components/useTableFilter";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import BusinessHeader from "../../_components/BusinessHeader";
import {
  PICKUP_STATUS_COLOR,
  PICKUP_STATUS_LABEL,
  PICKUP_STATUS_OPTIONS,
} from "../../constants";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

interface PickupReservationsContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
  };
  applications: BottleReservationPickupApplicationResponse[];
  totalElements: number;
}

export default function PickupReservationsContent({
  searchParams,
  applications,
  totalElements,
}: PickupReservationsContentProps) {
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;

  const { openFilter, filterRef, toggleFilter, closeFilter, getFilterValue, updateFilter } =
    useTableFilter({
      searchParams,
      basePath: "/business/pickup-reservations",
    });

  return (
    <>
      <BusinessHeader title="픽업 예약 관리" />

      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50" ref={filterRef}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                    병 이름
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                    신청자
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-700">
                    신청수량
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-700">
                    확정수량
                  </th>
                  <FilterHeader
                    label="상태"
                    filterKey="status"
                    options={PICKUP_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    currentValue={getFilterValue("status")}
                    isOpen={openFilter === "status"}
                    onToggle={toggleFilter}
                    onSelect={updateFilter}
                    onClose={closeFilter}
                    dropdownWidth="w-36"
                  />
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                    신청일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-700">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      픽업 예약 신청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() =>
                        router.push(`/business/pickup-reservations/${app.id}`)
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {app.id}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-gray-900">
                        {app.bottleName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {app.applicantUser?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {app.quantity ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-amber-600">
                        {app.confirmedQuantity ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={
                            PICKUP_STATUS_COLOR[app.status ?? ""] ??
                            "bg-gray-100 text-gray-700"
                          }
                        >
                          {PICKUP_STATUS_LABEL[app.status ?? ""] ?? app.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/business/pickup-reservations/${app.id}`,
                              )
                            }
                            className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                            title="상세"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchParams={searchParams}
            basePath="/business/pickup-reservations"
          />
        </div>
      </div>
    </>
  );
}
```

### 3-3: 테스트 통과 확인

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -20
```

Expected:
```
✓ src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx (5)
Test Files  1 passed (1)
Tests  5 passed (5)
```

테스트가 실패하면 에러 메시지를 읽고 구현 코드를 수정한다. 일반적인 실패 원인:
- `Badge` 컴포넌트가 `className` prop을 합산(cn)하여 `text-gray-700`을 덮어쓰는 경우 → Badge를 `<span>`으로 교체하거나 Badge 구현 확인
- `Pagination`이 `useRouter`를 호출하는 경우 → mock이 이미 적용되어 있으므로 문제없음

- [ ] **Step 5: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/business/pickup-reservations/_components/PickupReservationsContent.tsx \
        src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx
git commit -m "feat: add PickupReservationsContent with tests (TDD)"
```

---

## Task 4: 픽업 예약 리스트 RSC page.tsx

테스트 없는 RSC — 데이터 페칭 로직만 포함, 클라이언트 컴포넌트에 위임.

**Files:**
- Create: `src/app/business/pickup-reservations/page.tsx`

- [ ] **Step 1: page.tsx 작성**

```typescript
import {
  type GetApiUsersBusinessesPickupReservationsApplicationsStatus,
  getApiUsersBusinessesPickupReservationsApplications,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import PickupReservationsContent from "./_components/PickupReservationsContent";

interface PickupReservationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
}

export default async function PickupReservationsPage({
  searchParams,
}: PickupReservationsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const res = await getApiUsersBusinessesPickupReservationsApplications(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
      ...(params.status
        ? {
            status:
              params.status as GetApiUsersBusinessesPickupReservationsApplicationsStatus,
          }
        : {}),
    },
    withToken(token),
  );

  return (
    <PickupReservationsContent
      searchParams={params}
      applications={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
```

- [ ] **Step 2: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/business/pickup-reservations/page.tsx
git commit -m "feat: add pickup-reservations list RSC page"
```

---

## Task 5: TDD — PickupApplicationDetailContent (상세 UI)

**Files:**
- Create: `src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.test.tsx`
- Create: `src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`

### 5-1: 테스트 먼저 작성

- [ ] **Step 1: 테스트 파일 작성**

`src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PickupApplicationDetailContent from "./PickupApplicationDetailContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

const mockApplication = {
  id: 42,
  noticeId: 10,
  bottleId: 5,
  bottleName: "Yamazaki 12",
  bottleImgUrl: "https://example.com/bottle.jpg",
  applicantUser: {
    name: "이영희",
    nickname: "whisky_lover",
    email: "lee@example.com",
    phone: "010-1234-5678",
  },
  status: "CONFIRMED" as const,
  quantity: 1,
  confirmedQuantity: 1,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-16T00:00:00Z",
};

describe("PickupApplicationDetailContent", () => {
  it("renders page title", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(screen.getByText("픽업 예약 상세")).toBeInTheDocument();
  });

  it("renders bottle name", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(screen.getAllByText("Yamazaki 12").length).toBeGreaterThan(0);
  });

  it("renders applicant name", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(screen.getByText("이영희")).toBeInTheDocument();
  });

  it("renders applicant email", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(screen.getByText("lee@example.com")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(screen.getByText("확정")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    expect(
      screen.getByText("픽업 예약 목록으로 돌아가기"),
    ).toBeInTheDocument();
  });

  it("renders bottle image when bottleImgUrl is provided", () => {
    render(<PickupApplicationDetailContent application={mockApplication} />);
    const img = screen.getByAltText("Yamazaki 12");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/bottle.jpg");
  });

  it("does not render image when bottleImgUrl is absent", () => {
    const appWithoutImage = { ...mockApplication, bottleImgUrl: undefined };
    render(
      <PickupApplicationDetailContent application={appWithoutImage} />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -20
```

Expected: `Cannot find module './PickupApplicationDetailContent'` 에러로 실패. **반드시 실패해야 한다.**

### 5-2: 구현

- [ ] **Step 3: `PickupApplicationDetailContent.tsx` 구현**

`src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`:

```typescript
"use client";

import type { BottleReservationPickupApplicationResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BusinessHeader from "../../../_components/BusinessHeader";
import {
  PICKUP_STATUS_COLOR,
  PICKUP_STATUS_LABEL,
} from "../../../constants";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

interface PickupApplicationDetailContentProps {
  application: BottleReservationPickupApplicationResponse;
}

export default function PickupApplicationDetailContent({
  application,
}: PickupApplicationDetailContentProps) {
  const router = useRouter();

  return (
    <>
      <BusinessHeader title="픽업 예약 상세" />

      <div className="p-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/business/pickup-reservations")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            픽업 예약 목록으로 돌아가기
          </button>
        </div>

        <div className="space-y-4">
          {/* 병 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">병 정보</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                {application.bottleImgUrl && (
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={application.bottleImgUrl}
                      alt={application.bottleName ?? "병 이미지"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">신청 ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {application.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">공고 ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {application.noticeId ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">병 이름</p>
                    <p className="text-sm font-medium text-gray-900">
                      {application.bottleName ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">병 ID</p>
                    <p className="text-sm font-medium text-gray-900">
                      {application.bottleId ?? "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 신청 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">신청 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">상태</p>
                <div className="mt-1">
                  <Badge
                    className={
                      PICKUP_STATUS_COLOR[application.status ?? ""] ??
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {PICKUP_STATUS_LABEL[application.status ?? ""] ??
                      application.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">신청수량</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.quantity ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">확정수량</p>
                <p className="text-sm font-medium text-amber-600">
                  {application.confirmedQuantity ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">신청일</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">수정일</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* 신청자 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">신청자 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.applicantUser?.name ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">닉네임</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.applicantUser?.nickname ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.applicantUser?.email ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">전화번호</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.applicantUser?.phone ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 5-3: 테스트 통과 확인

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -20
```

Expected:
```
✓ src/app/business/pickup-reservations/_components/PickupReservationsContent.test.tsx (5)
✓ src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.test.tsx (8)
Test Files  2 passed (2)
Tests  13 passed (13)
```

테스트가 실패하면 에러 메시지를 읽고 구현 코드를 수정한다. 일반적인 실패 원인:
- `next/image`의 `fill` prop이 있을 때 `alt`가 부모 컨테이너에 묻히는 경우 → mock이 `<img alt={alt}>`를 렌더링하므로 getByAltText가 동작해야 함
- `PICKUP_STATUS_LABEL["CONFIRMED"]`가 `"확정"`을 반환하는지 확인 (constants.ts 오타 체크)

- [ ] **Step 5: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

`next/image`의 `src` 외부 URL 에러가 발생하면 `next.config.ts`의 `images.remotePatterns` 확인:
- 이미 커버된 도메인이면 OK
- 개발 중이라 임시 bypass가 필요하면 `images: { unoptimized: true }` 추가

- [ ] **Step 6: 커밋**

```bash
git add src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx \
        src/app/business/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.test.tsx
git commit -m "feat: add PickupApplicationDetailContent with tests (TDD)"
```

---

## Task 6: 픽업 예약 상세 RSC page.tsx

**Files:**
- Create: `src/app/business/pickup-reservations/[applicationId]/page.tsx`

- [ ] **Step 1: `[applicationId]/page.tsx` 작성**

```typescript
import { getApiUsersBusinessesPickupReservationsApplicationsApplicationid } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import PickupApplicationDetailContent from "./_components/PickupApplicationDetailContent";

interface PickupApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function PickupApplicationDetailPage({
  params,
}: PickupApplicationDetailPageProps) {
  const { applicationId } = await params;
  const token = await getAuthToken();

  try {
    const res =
      await getApiUsersBusinessesPickupReservationsApplicationsApplicationid(
        Number(applicationId),
        withToken(token),
      );

    return <PickupApplicationDetailContent application={res.data} />;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("[404]")) {
      notFound();
    }
    throw error;
  }
}
```

- [ ] **Step 2: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/business/pickup-reservations/[applicationId]/page.tsx
git commit -m "feat: add pickup-reservations detail RSC page"
```

---

## Task 7: 최종 빌드 및 전체 테스트 검증

- [ ] **Step 1: 전체 테스트 실행**

```bash
pnpm test:run 2>&1
```

Expected:
```
Test Files  2 passed (2)
Tests  13 passed (13)
```

- [ ] **Step 2: 빌드 실행**

```bash
pnpm build 2>&1 | tail -30
```

Expected: 빌드 성공. 에러 없음.

빌드 실패 시 일반적인 원인:
- `next/image` 외부 도메인 미설정 → `next.config.ts`에서 `images.remotePatterns` 또는 `images.unoptimized: true` 추가
- `@/app/admin/_components/Pagination` import → 경로가 올바른지 확인

- [ ] **Step 3: 개발 서버에서 수동 동작 확인**

```bash
pnpm dev
```

브라우저에서 확인:
- `http://localhost:3000/business/pickup-reservations` → 리스트 페이지 렌더링
- `http://localhost:3000/business/pickup-reservations/1` → 상세 페이지 렌더링 (실제 ID)
- 상태 `<select>` 필터 변경 시 URL이 `?status=APPLIED` 형태로 변경되는지 확인
- 행 클릭 → 상세 페이지로 이동
- 상세 페이지 "목록으로 돌아가기" → 리스트로 복귀

---

## Self-Review

**Spec coverage:**
- [x] `getApiUsersBusinessesPickupReservationsApplications` → 리스트 page.tsx (Task 4)
- [x] `getApiUsersBusinessesPickupReservationsApplicationsApplicationid` → 상세 page.tsx (Task 6)
- [x] `src/app/business` 하위 경로 — 올바른 경로 사용
- [x] TDD — 클라이언트 컴포넌트 모두 테스트 먼저 작성 후 구현 (Task 3, 5)
- [x] Vitest 인프라 세팅 (Task 1)
- [x] PAYMENT_COMPLETED 상태 포함 (business/constants.ts)

**Vercel Best Practices 적용:**
- RSC 기본 (page.tsx는 서버 컴포넌트) ✓
- barrel import 회피 (`@/apis/generated/api`에서 직접 named import) ✓
- 단일 API 호출이므로 Promise.all 불필요 ✓
