# Pickup Reservations Admin Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/pickup-reservations` 리스트 페이지와 `/admin/pickup-reservations/[applicationId]` 상세 페이지를 생성한다.

**Architecture:** Next.js App Router RSC 패턴 — `page.tsx`(서버 컴포넌트)에서 API 호출 후 데이터를 클라이언트 컴포넌트(`_components/`)로 props 전달. `getAuthToken()` + `withToken()`으로 인증 처리. Vercel best-practices: RSC 기본, 단일 Promise.all 병렬 페칭(필요시), barrel import 회피.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui Badge, overlay-kit (미사용), lucide-react, `@/apis/generated/api` (Orval 생성)

---

## File Map

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| 사이드바 메뉴 추가 | `src/app/admin/_components/AdminSidebar.tsx` | 수정 |
| 상태 상수 추가 | `src/app/admin/constants.ts` | 수정 |
| 리스트 RSC | `src/app/admin/pickup-reservations/page.tsx` | 신규 |
| 리스트 클라이언트 UI | `src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx` | 신규 |
| 상세 RSC | `src/app/admin/pickup-reservations/[applicationId]/page.tsx` | 신규 |
| 상세 클라이언트 UI | `src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx` | 신규 |

---

## Task 1: 상태 상수 추가 (PAYMENT_COMPLETED)

기존 `RESERVATION_STATUS_LABEL` / `RESERVATION_STATUS_COLOR`에 `PAYMENT_COMPLETED`가 없다. 이를 추가한다.

**Files:**
- Modify: `src/app/admin/constants.ts`

- [ ] **Step 1: constants.ts에 PAYMENT_COMPLETED 추가**

`src/app/admin/constants.ts`의 `RESERVATION_STATUS_LABEL`와 `RESERVATION_STATUS_COLOR` 두 곳에 항목을 추가한다:

```typescript
// RESERVATION_STATUS_LABEL에 추가
PAYMENT_COMPLETED: "결제완료",

// RESERVATION_STATUS_COLOR에 추가
PAYMENT_COMPLETED: "bg-cyan-100 text-cyan-700",
```

결과: `RESERVATION_STATUS_LABEL`는 다음처럼 됨:
```typescript
export const RESERVATION_STATUS_LABEL: Record<string, string> = {
  APPLIED: "신청완료",
  CONFIRMED: "확정",
  CANCELLED: "취소",
  REJECTED: "거절",
  WAITING_PICKUP: "픽업대기",
  RECEIVED: "수령완료",
  PAYMENT_COMPLETED: "결제완료",
};

export const RESERVATION_STATUS_COLOR: Record<string, string> = {
  APPLIED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
  WAITING_PICKUP: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-emerald-100 text-emerald-700",
  PAYMENT_COMPLETED: "bg-cyan-100 text-cyan-700",
};
```

- [ ] **Step 2: 타입체크**

```bash
cd /Users/morrison.k/Documents/study/app-router-with-claude
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/constants.ts
git commit -m "feat: add PAYMENT_COMPLETED to reservation status constants"
```

---

## Task 2: 사이드바에 픽업 예약 관리 메뉴 추가

**Files:**
- Modify: `src/app/admin/_components/AdminSidebar.tsx`

- [ ] **Step 1: AdminSidebar.tsx에 메뉴 항목 추가**

파일 상단 import에 `Truck` 아이콘을 추가하고, `menuItems` 배열에 픽업 예약 관리 항목을 추가한다.

```typescript
// 기존: import { Award, Ban, Calendar, Home, ImageIcon, Package, Users, Youtube } from "lucide-react";
import { Award, Ban, Calendar, Home, ImageIcon, Package, Truck, Users, Youtube } from "lucide-react";
```

`menuItems` 배열에서 `reservations` 항목 다음에 추가:

```typescript
const menuItems = [
  { id: "users", label: "회원 관리", icon: Users, href: "/admin/users" },
  { id: "products", label: "제품 관리", icon: Package, href: "/admin/products" },
  { id: "reservations", label: "예약 관리", icon: Calendar, href: "/admin/reservations" },
  { id: "pickup-reservations", label: "픽업 예약 관리", icon: Truck, href: "/admin/pickup-reservations" }, // 추가
  { id: "membership", label: "멤버십 관리", icon: Award, href: "/admin/membership" },
  { id: "banners", label: "배너 관리", icon: ImageIcon, href: "/admin/banners" },
  { id: "blacklist", label: "블랙리스트", icon: Ban, href: "/admin/blacklist" },
  { id: "youtube", label: "YouTube 관리", icon: Youtube, href: "/admin/youtube" },
];
```

- [ ] **Step 2: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/_components/AdminSidebar.tsx
git commit -m "feat: add pickup-reservations menu to admin sidebar"
```

---

## Task 3: 픽업 예약 리스트 페이지 생성

**Files:**
- Create: `src/app/admin/pickup-reservations/page.tsx`
- Create: `src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx`

### Step 3-1: RSC page.tsx 생성

- [ ] **Step 1: page.tsx 작성**

`src/app/admin/pickup-reservations/page.tsx`를 생성한다:

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

### Step 3-2: 클라이언트 컴포넌트 생성

- [ ] **Step 2: PickupReservationsContent.tsx 작성**

`src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx`를 생성한다:

```typescript
"use client";

import type { BottleReservationPickupApplicationResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminHeader from "../../_components/AdminHeader";
import FilterHeader from "../../_components/FilterHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { useTableFilter } from "../../_components/useTableFilter";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
} from "../../constants";

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "APPLIED", label: "신청완료" },
  { value: "CONFIRMED", label: "확정" },
  { value: "PAYMENT_COMPLETED", label: "결제완료" },
  { value: "WAITING_PICKUP", label: "픽업대기" },
  { value: "RECEIVED", label: "수령완료" },
  { value: "CANCELLED", label: "취소" },
  { value: "REJECTED", label: "거절" },
];

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
  const { toggle } = useSidebar();
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;

  const { openFilter, filterRef, toggleFilter, closeFilter, getFilterValue, updateFilter } =
    useTableFilter({
      searchParams,
      basePath: "/admin/pickup-reservations",
    });

  return (
    <>
      <AdminHeader
        title="픽업 예약 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr ref={filterRef}>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    ID
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    병 이름
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    신청자
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-center text-gray-700 uppercase">
                    신청수량
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-center text-gray-700 uppercase">
                    확정수량
                  </th>
                  <FilterHeader
                    label="상태"
                    filterKey="status"
                    options={STATUS_OPTIONS}
                    currentValue={getFilterValue("status")}
                    isOpen={openFilter === "status"}
                    onToggle={toggleFilter}
                    onSelect={updateFilter}
                    onClose={closeFilter}
                    dropdownWidth="w-36"
                  />
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    신청일
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
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
                        router.push(
                          `/admin/pickup-reservations/${app.id}`,
                        )
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {app.id}
                      </td>
                      <td className="typo-medium-14 max-w-[200px] truncate px-4 py-3 text-gray-900">
                        {app.bottleName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {app.applicantUser?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {app.quantity ?? "-"}
                      </td>
                      <td className="typo-medium-14 px-4 py-3 text-center text-amber-600">
                        {app.confirmedQuantity ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={
                            RESERVATION_STATUS_COLOR[app.status ?? ""] ??
                            "bg-gray-100 text-gray-700"
                          }
                        >
                          {RESERVATION_STATUS_LABEL[app.status ?? ""] ??
                            app.status}
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
                                `/admin/pickup-reservations/${app.id}`,
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
            basePath="/admin/pickup-reservations"
          />
        </div>
      </div>
    </>
  );
}
```

> **주의:** `filterRef`의 타입은 `RefObject<HTMLTableSectionElement>`이므로 `<thead>` → `<tr ref={filterRef}>`에서 타입 불일치가 생길 수 있다. `useTableFilter`의 `filterRef`는 `useRef<HTMLTableSectionElement>(null)`이나 실제로는 `<thead ref={filterRef}>`에 붙여야 올바르다. Step 3 검증 단계에서 타입 에러를 확인한다.

- [ ] **Step 3: 타입체크 & 린트**

```bash
pnpm tsc --noEmit 2>&1 | head -50
pnpm lint 2>&1 | head -50
```

Expected: 에러 없음. `filterRef` 타입 불일치가 나오면 `<thead ref={filterRef as React.RefObject<HTMLTableSectionElement>}>` 형태로 수정하거나, `filterRef`를 `<div>`로 감싸는 대신 `<thead>` 태그에 직접 붙이는 방식을 확인한다.

실제로 `useTableFilter`를 살펴보면 `filterRef`는 `useRef<HTMLTableSectionElement>(null)`로 선언되어 있고 `<thead>`(=`HTMLTableSectionElement`)에 붙이는 것이 올바르다:

```tsx
// thead에 ref 붙이기
<thead className="border-b border-gray-200 bg-gray-50" ref={filterRef}>
  <tr>
    ...
  </tr>
</thead>
```

타입 에러가 발생하면 위와 같이 `<thead ref={filterRef}>` 방식으로 수정한다.

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/pickup-reservations/page.tsx \
        src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx
git commit -m "feat: add pickup-reservations list page"
```

---

## Task 4: 픽업 예약 상세 페이지 생성

**Files:**
- Create: `src/app/admin/pickup-reservations/[applicationId]/page.tsx`
- Create: `src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`

### Step 4-1: RSC page.tsx 생성

- [ ] **Step 1: [applicationId]/page.tsx 작성**

`src/app/admin/pickup-reservations/[applicationId]/page.tsx`를 생성한다:

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

### Step 4-2: 클라이언트 컴포넌트 생성

- [ ] **Step 2: PickupApplicationDetailContent.tsx 작성**

`src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`를 생성한다:

```typescript
"use client";

import type { BottleReservationPickupApplicationResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import {
  RESERVATION_STATUS_COLOR,
  RESERVATION_STATUS_LABEL,
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
  const { toggle } = useSidebar();
  const router = useRouter();

  return (
    <>
      <AdminHeader
        title="픽업 예약 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/pickup-reservations")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            픽업 예약 목록으로 돌아가기
          </button>
        </div>

        <div className="space-y-6">
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
                    <p className="typo-medium-14 text-gray-900">
                      {application.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">공고 ID</p>
                    <p className="typo-medium-14 text-gray-900">
                      {application.noticeId ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">병 ID</p>
                    <p className="typo-medium-14 text-gray-900">
                      {application.bottleId ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">병 이름</p>
                    <p className="typo-medium-14 text-gray-900">
                      {application.bottleName ?? "-"}
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
                      RESERVATION_STATUS_COLOR[application.status ?? ""] ??
                      "bg-gray-100 text-gray-700"
                    }
                  >
                    {RESERVATION_STATUS_LABEL[application.status ?? ""] ??
                      application.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">신청수량</p>
                <p className="typo-medium-14 text-gray-900">
                  {application.quantity ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">확정수량</p>
                <p className="typo-medium-14 text-amber-600">
                  {application.confirmedQuantity ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">신청일</p>
                <p className="typo-medium-14 text-gray-900">
                  {formatDate(application.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">수정일</p>
                <p className="typo-medium-14 text-gray-900">
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
                <p className="typo-medium-14 text-gray-900">
                  {application.applicantUser?.name ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">닉네임</p>
                <p className="typo-medium-14 text-gray-900">
                  {application.applicantUser?.nickname ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="typo-medium-14 text-gray-900">
                  {application.applicantUser?.email ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">전화번호</p>
                <p className="typo-medium-14 text-gray-900">
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

- [ ] **Step 3: 타입체크 & 린트**

```bash
pnpm tsc --noEmit 2>&1 | head -50
pnpm lint 2>&1 | head -50
```

Expected: 에러 없음.

`next/image`의 `src` prop은 외부 URL을 허용해야 하므로, `next.config.ts`에 이미지 도메인 설정이 없으면 에러가 날 수 있다. 에러 발생 시:
1. `next.config.ts`를 확인하여 기존 `images.remotePatterns` 설정을 확인
2. 이미 설정된 도메인이 커버하면 OK, 아니면 적절한 도메인 추가
3. 외부 이미지 처리가 불확실하면 `<img>` 태그로 대체 (Tailwind 클래스 그대로)

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/pickup-reservations/[applicationId]/page.tsx \
        src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx
git commit -m "feat: add pickup-reservations detail page"
```

---

## Task 5: 빌드 최종 검증

- [ ] **Step 1: 전체 빌드 실행**

```bash
pnpm build 2>&1 | tail -30
```

Expected: 빌드 성공. 에러 없음.

빌드 실패 시 에러 메시지를 확인하고 해당 파일을 수정한다.

- [ ] **Step 2: 개발 서버에서 동작 확인 (선택)**

```bash
pnpm dev
```

브라우저에서 다음 경로 확인:
- `http://localhost:3000/admin/pickup-reservations` — 리스트 페이지
- `http://localhost:3000/admin/pickup-reservations/1` — 상세 페이지 (실제 ID로 변경)
- 사이드바에 "픽업 예약 관리" 메뉴가 표시되는지 확인
- 상태 필터 드롭다운이 동작하는지 확인
- 행 클릭 시 상세 페이지로 이동하는지 확인
- 상세 페이지에서 목록으로 돌아가기 버튼이 동작하는지 확인

---

## Self-Review Checklist

- [x] Task 1: constants.ts에 PAYMENT_COMPLETED 추가
- [x] Task 2: AdminSidebar.tsx에 픽업 예약 관리 메뉴 추가
- [x] Task 3: 리스트 RSC + 클라이언트 컴포넌트 생성
- [x] Task 4: 상세 RSC + 클라이언트 컴포넌트 생성
- [x] Task 5: 빌드 검증

**Vercel Best Practices 적용:**
- RSC 기본 (page.tsx는 서버 컴포넌트) ✓
- barrel import 회피 (`@/apis/generated/api`에서 직접 named import) ✓
- 단일 API 호출이므로 Promise.all 불필요 ✓
- `useTransition` for non-urgent updates (Pagination 컴포넌트 내부에서 이미 사용) ✓
