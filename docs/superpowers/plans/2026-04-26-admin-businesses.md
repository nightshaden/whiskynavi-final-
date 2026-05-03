# Admin Businesses Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/businesses` 하위에 1사업자 신청 관리(applications)와 사업자 멤버 관리(members) 페이지를 생성한다.

**Architecture:** 기존 admin 패턴 그대로 — RSC `page.tsx`가 데이터 페칭, 클라이언트 `_components/`가 UI 렌더링. AdminHeader + useSidebar 사용. 상태 변경(승인/반려/픽업권한)은 Server Actions + overlay-kit 모달로 처리. 클라이언트 컴포넌트는 Vitest TDD 적용.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Vitest(이미 설치됨), Tailwind CSS 4, shadcn/ui Badge/Dialog/Button/Label/Textarea, lucide-react, `@/apis/generated/api` (Orval), overlay-kit, `getAuthToken()` + `withToken()`, `AdminHeader` + `useSidebar` + `FilterHeader` + `Pagination` + `useTableFilter`

---

## File Map

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| Admin 사이드바 | `src/app/admin/_components/AdminSidebar.tsx` | 수정 |
| businesses 리디렉션 | `src/app/admin/businesses/page.tsx` | 신규 |
| 신청 목록 클라이언트 | `src/app/admin/businesses/applications/_components/BusinessApplicationsContent.tsx` | 신규 |
| 신청 목록 테스트 | `src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx` | 신규 |
| 신청 목록 RSC | `src/app/admin/businesses/applications/page.tsx` | 신규 |
| 승인 Server Action | `src/app/admin/businesses/applications/[applicationId]/actions.ts` | 신규 |
| 승인 모달 | `src/app/admin/businesses/applications/[applicationId]/_components/ApplicationApproveModal.tsx` | 신규 |
| 반려 모달 | `src/app/admin/businesses/applications/[applicationId]/_components/ApplicationRejectModal.tsx` | 신규 |
| 신청 상세 클라이언트 | `src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.tsx` | 신규 |
| 신청 상세 테스트 | `src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.test.tsx` | 신규 |
| 신청 상세 RSC | `src/app/admin/businesses/applications/[applicationId]/page.tsx` | 신규 |
| 멤버 목록 클라이언트 | `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx` | 신규 |
| 멤버 목록 테스트 | `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx` | 신규 |
| 멤버 목록 RSC | `src/app/admin/businesses/members/page.tsx` | 신규 |
| 픽업 권한 모달 | `src/app/admin/businesses/members/[userId]/_components/PickupRoleConfirmModal.tsx` | 신규 |
| 픽업 권한 Server Actions | `src/app/admin/businesses/members/[userId]/actions.ts` | 신규 |
| 멤버 상세 클라이언트 | `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx` | 신규 |
| 멤버 상세 테스트 | `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx` | 신규 |
| 멤버 상세 RSC | `src/app/admin/businesses/members/[userId]/page.tsx` | 신규 |

---

## Task 1: Admin Sidebar 메뉴 추가 + businesses 리디렉션

**Files:**
- Modify: `src/app/admin/_components/AdminSidebar.tsx`
- Create: `src/app/admin/businesses/page.tsx`

- [ ] **Step 1: AdminSidebar.tsx 수정**

`AdminSidebar.tsx` 상단 import에 `Briefcase` 추가:

```typescript
import { Award, Ban, Briefcase, Calendar, Home, ImageIcon, Package, Users, Youtube } from "lucide-react";
```

`menuItems` 배열에 blacklist 항목 앞에 추가:

```typescript
{
  id: "businesses",
  label: "사업자 관리",
  icon: Briefcase,
  href: "/admin/businesses",
},
```

결과 (`menuItems` 전체):

```typescript
const menuItems = [
  { id: "users", label: "회원 관리", icon: Users, href: "/admin/users" },
  { id: "products", label: "제품 관리", icon: Package, href: "/admin/products" },
  {
    id: "reservations",
    label: "예약 관리",
    icon: Calendar,
    href: "/admin/reservations",
  },
  {
    id: "membership",
    label: "멤버십 관리",
    icon: Award,
    href: "/admin/membership",
  },
  {
    id: "banners",
    label: "배너 관리",
    icon: ImageIcon,
    href: "/admin/banners",
  },
  {
    id: "businesses",
    label: "사업자 관리",
    icon: Briefcase,
    href: "/admin/businesses",
  },
  { id: "blacklist", label: "블랙리스트", icon: Ban, href: "/admin/blacklist" },
  {
    id: "youtube",
    label: "YouTube 관리",
    icon: Youtube,
    href: "/admin/youtube",
  },
];
```

- [ ] **Step 2: `/admin/businesses/page.tsx` 생성 (redirect)**

```typescript
import { redirect } from "next/navigation";

export default function BusinessesPage() {
  redirect("/admin/businesses/applications");
}
```

- [ ] **Step 3: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/_components/AdminSidebar.tsx \
        src/app/admin/businesses/page.tsx
git commit -m "feat: add businesses menu to admin sidebar"
```

---

## Task 2: TDD — BusinessApplicationsContent (신청 목록)

**Files:**
- Create: `src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx`
- Create: `src/app/admin/businesses/applications/_components/BusinessApplicationsContent.tsx`

### 2-1: 테스트 먼저 작성

- [ ] **Step 1: 테스트 파일 작성**

`src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessApplicationsContent from "./BusinessApplicationsContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const searchParams = {};

describe("BusinessApplicationsContent", () => {
  it("renders page title", () => {
    render(
      <BusinessApplicationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={0}
      />,
    );
    expect(screen.getByText("사업자 신청 관리")).toBeInTheDocument();
  });

  it("shows empty state when no applications", () => {
    render(
      <BusinessApplicationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={0}
      />,
    );
    expect(screen.getByText("사업자 신청이 없습니다.")).toBeInTheDocument();
  });

  it("shows total count", () => {
    render(
      <BusinessApplicationsContent
        searchParams={searchParams}
        applications={[]}
        totalElements={15}
      />,
    );
    expect(screen.getByText("총 15건")).toBeInTheDocument();
  });

  it("renders application row with business name and status", () => {
    const mockApp = {
      id: 1,
      businessName: "테스트 주류",
      representativeName: "홍길동",
      contact: "010-1234-5678",
      status: "PENDING" as const,
      createdAt: "2024-01-15T00:00:00Z",
      userId: 42,
    };
    render(
      <BusinessApplicationsContent
        searchParams={searchParams}
        applications={[mockApp]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("검토중")).toBeInTheDocument();
  });

  it("renders correct status badge label for APPROVED", () => {
    const mockApp = {
      id: 2,
      businessName: "승인된 주류",
      representativeName: "김철수",
      contact: "010-0000-0000",
      status: "APPROVED" as const,
      createdAt: "2024-02-01T00:00:00Z",
      userId: 43,
    };
    render(
      <BusinessApplicationsContent
        searchParams={searchParams}
        applications={[mockApp]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("승인")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: `Cannot find module './BusinessApplicationsContent'`로 실패. **반드시 실패해야 한다.**

### 2-2: 구현

- [ ] **Step 3: BusinessApplicationsContent.tsx 구현**

`src/app/admin/businesses/applications/_components/BusinessApplicationsContent.tsx`:

```typescript
"use client";

import type { AdminBusinessApplicationResponse } from "@/apis/generated/api";
import FilterHeader from "@/app/admin/_components/FilterHeader";
import Pagination from "@/app/admin/_components/Pagination";
import { useTableFilter } from "@/app/admin/_components/useTableFilter";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "검토중",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELED: "취소",
};

const APPLICATION_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-100 text-gray-700",
};

const APPLICATION_STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "PENDING", label: "검토중" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
  { value: "CANCELED", label: "취소" },
] as const;

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

interface BusinessApplicationsContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
  };
  applications: AdminBusinessApplicationResponse[];
  totalElements: number;
}

export default function BusinessApplicationsContent({
  searchParams,
  applications,
  totalElements,
}: BusinessApplicationsContentProps) {
  const router = useRouter();
  const { toggle } = useSidebar();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;

  const { openFilter, filterRef, toggleFilter, closeFilter, getFilterValue, updateFilter } =
    useTableFilter({
      searchParams,
      basePath: "/admin/businesses/applications",
    });

  return (
    <>
      <AdminHeader
        title="사업자 신청 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className="border-b border-gray-200 bg-gray-50"
                ref={filterRef}
              >
                <tr>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    ID
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    업체명
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    대표자
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    연락처
                  </th>
                  <FilterHeader
                    label="상태"
                    filterKey="status"
                    options={APPLICATION_STATUS_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    currentValue={getFilterValue("status")}
                    isOpen={openFilter === "status"}
                    onToggle={toggleFilter}
                    onSelect={updateFilter}
                    onClose={closeFilter}
                    dropdownWidth="w-28"
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
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      사업자 신청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() =>
                        router.push(
                          `/admin/businesses/applications/${app.id}`,
                        )
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {app.id}
                      </td>
                      <td className="typo-medium-14 max-w-[200px] truncate px-4 py-3 text-gray-900">
                        {app.businessName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {app.representativeName ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {app.contact ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          className={
                            APPLICATION_STATUS_COLOR[app.status ?? ""] ??
                            "bg-gray-100 text-gray-700"
                          }
                        >
                          {APPLICATION_STATUS_LABEL[app.status ?? ""] ??
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
                                `/admin/businesses/applications/${app.id}`,
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
            basePath="/admin/businesses/applications"
          />
        </div>
      </div>
    </>
  );
}
```

### 2-3: 테스트 통과 확인

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected:
```
✓ src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx (5)
Tests  5 passed (5)
```

- [ ] **Step 5: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/admin/businesses/applications/_components/BusinessApplicationsContent.tsx \
        src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx
git commit -m "feat: add BusinessApplicationsContent with tests (TDD)"
```

---

## Task 3: 신청 목록 RSC page.tsx

**Files:**
- Create: `src/app/admin/businesses/applications/page.tsx`

- [ ] **Step 1: page.tsx 작성**

```typescript
import {
  type GetApiAdminBusinessesApplicationsStatus,
  getApiAdminBusinessesApplications,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessApplicationsContent from "./_components/BusinessApplicationsContent";

interface BusinessApplicationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
  }>;
}

export default async function BusinessApplicationsPage({
  searchParams,
}: BusinessApplicationsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const res = await getApiAdminBusinessesApplications(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
      ...(params.status
        ? {
            status:
              params.status as GetApiAdminBusinessesApplicationsStatus,
          }
        : {}),
    },
    withToken(token),
  );

  return (
    <BusinessApplicationsContent
      searchParams={params}
      applications={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
```

- [ ] **Step 2: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/businesses/applications/page.tsx
git commit -m "feat: add business applications list RSC page"
```

---

## Task 4: 신청 상세 Server Actions

**Files:**
- Create: `src/app/admin/businesses/applications/[applicationId]/actions.ts`

- [ ] **Step 1: actions.ts 작성**

```typescript
"use server";

import {
  postApiAdminBusinessesApplicationsApplicationidApprove,
  postApiAdminBusinessesApplicationsApplicationidReject,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveApplicationAction(applicationId: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBusinessesApplicationsApplicationidApprove(
      applicationId,
      withToken(token),
    );
    revalidatePath(`/admin/businesses/applications/${applicationId}`);
    revalidatePath("/admin/businesses/applications");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "승인에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function rejectApplicationAction(
  applicationId: number,
  data: { rejectReason?: string; adminMemo?: string },
) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBusinessesApplicationsApplicationidReject(
      applicationId,
      data,
      withToken(token),
    );
    revalidatePath(`/admin/businesses/applications/${applicationId}`);
    revalidatePath("/admin/businesses/applications");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "반려에 실패했습니다.";
    return { success: false, error: message };
  }
}
```

- [ ] **Step 2: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/businesses/applications/[applicationId]/actions.ts
git commit -m "feat: add approve/reject server actions for business applications"
```

---

## Task 5: 승인/반려 모달 컴포넌트

**Files:**
- Create: `src/app/admin/businesses/applications/[applicationId]/_components/ApplicationApproveModal.tsx`
- Create: `src/app/admin/businesses/applications/[applicationId]/_components/ApplicationRejectModal.tsx`

- [ ] **Step 1: ApplicationApproveModal.tsx 작성**

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveApplicationAction } from "../actions";

interface ApplicationApproveModalProps {
  isOpen: boolean;
  close: () => void;
  applicationId: number;
}

export default function ApplicationApproveModal({
  isOpen,
  close,
  applicationId,
}: ApplicationApproveModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveApplicationAction(applicationId);
      if (result.success) {
        close();
        router.refresh();
      } else {
        setError(result.error ?? "승인에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사업자 신청 승인</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          이 신청을 승인하시겠습니까? 승인 후 사업자 역할이 부여됩니다.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={close}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            className="flex-1 bg-amber-600 hover:bg-amber-700"
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "승인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: ApplicationRejectModal.tsx 작성**

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rejectApplicationAction } from "../actions";

interface ApplicationRejectModalProps {
  isOpen: boolean;
  close: () => void;
  applicationId: number;
}

export default function ApplicationRejectModal({
  isOpen,
  close,
  applicationId,
}: ApplicationRejectModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [adminMemo, setAdminMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError("반려 사유를 입력해주세요.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectApplicationAction(applicationId, {
        rejectReason,
        adminMemo: adminMemo.trim() || undefined,
      });
      if (result.success) {
        close();
        router.refresh();
      } else {
        setError(result.error ?? "반려에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>사업자 신청 반려</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rejectReason">반려 사유 *</Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="신청자에게 노출되는 반려 사유를 입력하세요."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="adminMemo">내부 메모 (선택)</Label>
            <Textarea
              id="adminMemo"
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              rows={2}
              placeholder="신청자에게 노출되지 않는 내부 메모입니다."
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={close}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : "반려"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/businesses/applications/[applicationId]/_components/ApplicationApproveModal.tsx \
        src/app/admin/businesses/applications/[applicationId]/_components/ApplicationRejectModal.tsx
git commit -m "feat: add approve/reject modals for business application detail"
```

---

## Task 6: TDD — BusinessApplicationDetailContent

**Files:**
- Create: `src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.test.tsx`
- Create: `src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.tsx`

### 6-1: 테스트 먼저 작성

- [ ] **Step 1: 테스트 파일 작성**

`src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessApplicationDetailContent from "./BusinessApplicationDetailContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

const mockApplication = {
  id: 1,
  businessName: "테스트 주류상사",
  representativeName: "홍길동",
  businessRegistrationNumber: "123-45-67890",
  contact: "010-1234-5678",
  pickupAddress: "서울시 강남구 테헤란로 1",
  openingDate: "2020-01-01",
  taxType: "일반과세자",
  status: "PENDING" as const,
  createdAt: "2024-01-15T00:00:00Z",
  updatedAt: "2024-01-16T00:00:00Z",
  userId: 42,
};

describe("BusinessApplicationDetailContent", () => {
  it("renders page title", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(screen.getByText("사업자 신청 상세")).toBeInTheDocument();
  });

  it("renders business name", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(screen.getByText("테스트 주류상사")).toBeInTheDocument();
  });

  it("renders status badge as 검토중 for PENDING", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(screen.getByText("검토중")).toBeInTheDocument();
  });

  it("shows approve and reject buttons when status is PENDING", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(screen.getByText("승인")).toBeInTheDocument();
    expect(screen.getByText("반려")).toBeInTheDocument();
  });

  it("hides approve and reject buttons when status is APPROVED", () => {
    render(
      <BusinessApplicationDetailContent
        application={{ ...mockApplication, status: "APPROVED" }}
        auditLogs={[]}
      />,
    );
    expect(screen.queryByText("승인")).not.toBeInTheDocument();
    expect(screen.queryByText("반려")).not.toBeInTheDocument();
  });

  it("renders back button", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(
      screen.getByText("신청 목록으로 돌아가기"),
    ).toBeInTheDocument();
  });

  it("renders audit log section when logs exist", () => {
    const auditLogs = [
      {
        id: 1,
        applicationId: 1,
        beforeStatus: "PENDING" as const,
        afterStatus: "APPROVED" as const,
        actorUsername: "admin@test.com",
        createdAt: "2024-01-16T00:00:00Z",
        action: "APPROVE",
        actorType: "ADMIN",
        actorUserId: 1,
        memo: undefined,
      },
    ];
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={auditLogs}
      />,
    );
    expect(screen.getByText("처리 이력")).toBeInTheDocument();
  });

  it("does not render audit log section when logs are empty", () => {
    render(
      <BusinessApplicationDetailContent
        application={mockApplication}
        auditLogs={[]}
      />,
    );
    expect(screen.queryByText("처리 이력")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: `Cannot find module './BusinessApplicationDetailContent'`로 실패. **반드시 실패해야 한다.**

### 6-2: 구현

- [ ] **Step 3: BusinessApplicationDetailContent.tsx 구현**

`src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.tsx`:

```typescript
"use client";

import type {
  AdminBusinessApplicationAuditLogResponse,
  AdminBusinessApplicationResponse,
} from "@/apis/generated/api";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { overlay } from "overlay-kit";
import { useRouter } from "next/navigation";
import ApplicationApproveModal from "./ApplicationApproveModal";
import ApplicationRejectModal from "./ApplicationRejectModal";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "검토중",
  APPROVED: "승인",
  REJECTED: "반려",
  CANCELED: "취소",
};

const APPLICATION_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-100 text-gray-700",
};

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

interface BusinessApplicationDetailContentProps {
  application: AdminBusinessApplicationResponse;
  auditLogs: AdminBusinessApplicationAuditLogResponse[];
}

export default function BusinessApplicationDetailContent({
  application,
  auditLogs,
}: BusinessApplicationDetailContentProps) {
  const router = useRouter();
  const { toggle } = useSidebar();

  const isPending = application.status === "PENDING";

  const handleApprove = () => {
    overlay.open((props) => (
      <ApplicationApproveModal
        {...props}
        applicationId={application.id!}
      />
    ));
  };

  const handleReject = () => {
    overlay.open((props) => (
      <ApplicationRejectModal
        {...props}
        applicationId={application.id!}
      />
    ));
  };

  return (
    <>
      <AdminHeader
        title="사업자 신청 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/businesses/applications")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            신청 목록으로 돌아가기
          </button>
          {isPending && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApprove}
                className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-white transition-colors hover:bg-amber-700"
              >
                <CheckCircle size={14} />
                승인
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-white transition-colors hover:bg-red-700"
              >
                <XCircle size={14} />
                반려
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* 신청 상태 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">신청 정보</h3>
                <Badge
                  className={
                    APPLICATION_STATUS_COLOR[application.status ?? ""] ??
                    "bg-gray-100 text-gray-700"
                  }
                >
                  {APPLICATION_STATUS_LABEL[application.status ?? ""] ??
                    application.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">신청 ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">신청자 ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.userId ?? "-"}
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
              {application.rejectReason && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">반려 사유</p>
                  <p className="text-sm font-medium text-red-600">
                    {application.rejectReason}
                  </p>
                </div>
              )}
              {application.adminMemo && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">관리자 메모</p>
                  <p className="text-sm font-medium text-gray-900">
                    {application.adminMemo}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">사업자 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">업체명</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.businessName ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자등록번호</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.businessRegistrationNumber ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">대표자명</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.representativeName ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">연락처</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.contact ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">개업일</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.openingDate ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">과세유형</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.taxType ?? "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">픽업 주소</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.pickupAddress ?? "-"}
                </p>
              </div>
              {application.documentDownloadUrl && (
                <div>
                  <p className="text-xs text-gray-500">사업자등록증</p>
                  <a
                    href={application.documentDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-amber-600 hover:underline"
                  >
                    {application.documentOriginalFilename ?? "다운로드"}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 처리 이력 */}
          {auditLogs.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="font-bold text-gray-900">처리 이력</h3>
              </div>
              <div className="divide-y divide-gray-100 p-6">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {APPLICATION_STATUS_LABEL[log.beforeStatus ?? ""] ??
                            log.beforeStatus ??
                            "-"}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm font-medium text-amber-600">
                          {APPLICATION_STATUS_LABEL[log.afterStatus ?? ""] ??
                            log.afterStatus ??
                            "-"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    {log.actorUsername && (
                      <p className="mt-1 text-xs text-gray-500">
                        처리자: {log.actorUsername}
                      </p>
                    )}
                    {log.memo && (
                      <p className="mt-1 text-xs text-gray-500">
                        메모: {log.memo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

### 6-3: 테스트 통과 확인

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected:
```
✓ src/app/admin/businesses/applications/_components/BusinessApplicationsContent.test.tsx (5)
✓ src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.test.tsx (8)
Tests  13 passed (13)
```

- [ ] **Step 5: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.tsx \
        src/app/admin/businesses/applications/[applicationId]/_components/BusinessApplicationDetailContent.test.tsx
git commit -m "feat: add BusinessApplicationDetailContent with tests (TDD)"
```

---

## Task 7: 신청 상세 RSC page.tsx

**Files:**
- Create: `src/app/admin/businesses/applications/[applicationId]/page.tsx`

- [ ] **Step 1: page.tsx 작성**

```typescript
import {
  getApiAdminBusinessesApplicationsApplicationid,
  getApiAdminBusinessesApplicationsApplicationidAuditLogs,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import BusinessApplicationDetailContent from "./_components/BusinessApplicationDetailContent";

interface BusinessApplicationDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export default async function BusinessApplicationDetailPage({
  params,
}: BusinessApplicationDetailPageProps) {
  const { applicationId } = await params;
  const token = await getAuthToken();

  try {
    const [applicationRes, auditLogsRes] = await Promise.all([
      getApiAdminBusinessesApplicationsApplicationid(
        Number(applicationId),
        withToken(token),
      ),
      getApiAdminBusinessesApplicationsApplicationidAuditLogs(
        Number(applicationId),
        withToken(token),
      ),
    ]);

    return (
      <BusinessApplicationDetailContent
        application={applicationRes.data}
        auditLogs={auditLogsRes.data}
      />
    );
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
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/businesses/applications/[applicationId]/page.tsx
git commit -m "feat: add business application detail RSC page"
```

---

## Task 8: TDD — BusinessMembersContent (멤버 목록)

**Files:**
- Create: `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx`
- Create: `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx`

### 8-1: 테스트 먼저 작성

- [ ] **Step 1: 테스트 파일 작성**

`src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessMembersContent from "./BusinessMembersContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const searchParams = {};

describe("BusinessMembersContent", () => {
  it("renders page title", () => {
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[]}
        totalElements={0}
      />,
    );
    expect(screen.getByText("사업자 멤버 관리")).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[]}
        totalElements={0}
      />,
    );
    expect(screen.getByText("사업자 멤버가 없습니다.")).toBeInTheDocument();
  });

  it("shows total count", () => {
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[]}
        totalElements={7}
      />,
    );
    expect(screen.getByText("총 7건")).toBeInTheDocument();
  });

  it("renders member row with name and username", () => {
    const mockMember = {
      userId: 10,
      name: "홍길동",
      username: "hong@example.com",
      hasPickupRole: false,
      roles: [],
    };
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[mockMember]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("hong@example.com")).toBeInTheDocument();
  });

  it("shows 픽업 권한 있음 badge when hasPickupRole is true", () => {
    const mockMember = {
      userId: 11,
      name: "김철수",
      username: "kim@example.com",
      hasPickupRole: true,
      roles: [],
    };
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[mockMember]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("픽업 권한 있음")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: `Cannot find module './BusinessMembersContent'`로 실패. **반드시 실패해야 한다.**

### 8-2: 구현

- [ ] **Step 3: BusinessMembersContent.tsx 구현**

`src/app/admin/businesses/members/_components/BusinessMembersContent.tsx`:

```typescript
"use client";

import type { AdminBusinessUserResponse } from "@/apis/generated/api";
import Pagination from "@/app/admin/_components/Pagination";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface BusinessMembersContentProps {
  searchParams: {
    page?: string;
    limit?: string;
  };
  members: AdminBusinessUserResponse[];
  totalElements: number;
}

export default function BusinessMembersContent({
  searchParams,
  members,
  totalElements,
}: BusinessMembersContentProps) {
  const router = useRouter();
  const { toggle } = useSidebar();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;

  return (
    <>
      <AdminHeader
        title="사업자 멤버 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    ID
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    이름
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    이메일
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    픽업 권한
                  </th>
                  <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      사업자 멤버가 없습니다.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member.userId}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      onClick={() =>
                        router.push(
                          `/admin/businesses/members/${member.userId}`,
                        )
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.userId}
                      </td>
                      <td className="typo-medium-14 px-4 py-3 text-gray-900">
                        {member.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.username ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {member.hasPickupRole ? (
                          <Badge className="bg-amber-100 text-amber-700">
                            픽업 권한 있음
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500">
                            픽업 권한 없음
                          </Badge>
                        )}
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
                                `/admin/businesses/members/${member.userId}`,
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
            basePath="/admin/businesses/members"
          />
        </div>
      </div>
    </>
  );
}
```

### 8-3: 테스트 통과 확인

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: 총 18개 테스트 통과.

- [ ] **Step 5: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/app/admin/businesses/members/_components/BusinessMembersContent.tsx \
        src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx
git commit -m "feat: add BusinessMembersContent with tests (TDD)"
```

---

## Task 9: 멤버 목록 RSC page.tsx + 픽업 권한 Server Actions

**Files:**
- Create: `src/app/admin/businesses/members/page.tsx`
- Create: `src/app/admin/businesses/members/[userId]/actions.ts`

- [ ] **Step 1: members/page.tsx 작성**

```typescript
import { getApiAdminBusinessesMembers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessMembersContent from "./_components/BusinessMembersContent";

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function BusinessMembersPage({
  searchParams,
}: BusinessMembersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const res = await getApiAdminBusinessesMembers(
    {
      page: params.page ? Number(params.page) - 1 : 0,
      size: params.limit ? Number(params.limit) : 20,
    },
    withToken(token),
  );

  return (
    <BusinessMembersContent
      searchParams={params}
      members={res.data.content ?? []}
      totalElements={res.data.totalElements ?? 0}
    />
  );
}
```

- [ ] **Step 2: members/[userId]/actions.ts 작성**

```typescript
"use server";

import {
  postApiAdminBusinessesMembersUseridPickupGrant,
  postApiAdminBusinessesMembersUseridPickupRevoke,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function grantPickupRoleAction(userId: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBusinessesMembersUseridPickupGrant(
      userId,
      withToken(token),
    );
    revalidatePath(`/admin/businesses/members/${userId}`);
    revalidatePath("/admin/businesses/members");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "픽업 권한 부여에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function revokePickupRoleAction(userId: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBusinessesMembersUseridPickupRevoke(
      userId,
      withToken(token),
    );
    revalidatePath(`/admin/businesses/members/${userId}`);
    revalidatePath("/admin/businesses/members");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "픽업 권한 회수에 실패했습니다.";
    return { success: false, error: message };
  }
}
```

- [ ] **Step 3: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/businesses/members/page.tsx \
        src/app/admin/businesses/members/[userId]/actions.ts
git commit -m "feat: add members list page and pickup role server actions"
```

---

## Task 10: 픽업 권한 모달 + TDD — BusinessMemberDetailContent

**Files:**
- Create: `src/app/admin/businesses/members/[userId]/_components/PickupRoleConfirmModal.tsx`
- Create: `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx`
- Create: `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx`

- [ ] **Step 1: PickupRoleConfirmModal.tsx 작성**

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { grantPickupRoleAction, revokePickupRoleAction } from "../actions";

interface PickupRoleConfirmModalProps {
  isOpen: boolean;
  close: () => void;
  userId: number;
  mode: "grant" | "revoke";
}

export default function PickupRoleConfirmModal({
  isOpen,
  close,
  userId,
  mode,
}: PickupRoleConfirmModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isGrant = mode === "grant";

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = isGrant
        ? await grantPickupRoleAction(userId)
        : await revokePickupRoleAction(userId);
      if (result.success) {
        close();
        router.refresh();
      } else {
        setError(result.error ?? "처리에 실패했습니다.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            픽업 권한 {isGrant ? "부여" : "회수"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          {isGrant
            ? "이 사업자에게 픽업 권한을 부여하시겠습니까?"
            : "이 사업자의 픽업 권한을 회수하시겠습니까?"}
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={close}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            className={`flex-1 ${isGrant ? "bg-amber-600 hover:bg-amber-700" : ""}`}
            variant={isGrant ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "처리 중..." : isGrant ? "부여" : "회수"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: 테스트 파일 작성**

`src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BusinessMemberDetailContent from "./BusinessMemberDetailContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

const mockMember = {
  userId: 10,
  name: "홍길동",
  username: "hong@example.com",
  businessName: "테스트 주류",
  businessRegistrationNumber: "123-45-67890",
  contact: "010-1234-5678",
  pickupAddress: "서울시 강남구",
  hasPickupRole: false,
  roles: [],
  businessCreatedAt: "2024-01-01T00:00:00Z",
  businessUpdatedAt: "2024-01-15T00:00:00Z",
};

describe("BusinessMemberDetailContent", () => {
  it("renders page title", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("사업자 멤버 상세")).toBeInTheDocument();
  });

  it("renders member name", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("홍길동")).toBeInTheDocument();
  });

  it("renders business name", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
  });

  it("shows 픽업 권한 없음 badge when hasPickupRole is false", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("픽업 권한 없음")).toBeInTheDocument();
  });

  it("shows grant button when hasPickupRole is false", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("픽업 권한 부여")).toBeInTheDocument();
    expect(screen.queryByText("픽업 권한 회수")).not.toBeInTheDocument();
  });

  it("shows revoke button when hasPickupRole is true", () => {
    render(
      <BusinessMemberDetailContent
        member={{ ...mockMember, hasPickupRole: true }}
      />,
    );
    expect(screen.getByText("픽업 권한 회수")).toBeInTheDocument();
    expect(screen.queryByText("픽업 권한 부여")).not.toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("멤버 목록으로 돌아가기")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: `Cannot find module './BusinessMemberDetailContent'`로 실패. **반드시 실패해야 한다.**

- [ ] **Step 4: BusinessMemberDetailContent.tsx 구현**

`src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx`:

```typescript
"use client";

import type { AdminBusinessUserDetailResponse } from "@/apis/generated/api";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { overlay } from "overlay-kit";
import { useRouter } from "next/navigation";
import PickupRoleConfirmModal from "./PickupRoleConfirmModal";

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

interface BusinessMemberDetailContentProps {
  member: AdminBusinessUserDetailResponse;
}

export default function BusinessMemberDetailContent({
  member,
}: BusinessMemberDetailContentProps) {
  const router = useRouter();
  const { toggle } = useSidebar();

  const handlePickupRoleAction = (mode: "grant" | "revoke") => {
    overlay.open((props) => (
      <PickupRoleConfirmModal
        {...props}
        userId={member.userId!}
        mode={mode}
      />
    ));
  };

  return (
    <>
      <AdminHeader
        title="사업자 멤버 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/businesses/members")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            멤버 목록으로 돌아가기
          </button>
          <div>
            {member.hasPickupRole ? (
              <button
                type="button"
                onClick={() => handlePickupRoleAction("revoke")}
                className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-white transition-colors hover:bg-red-700"
              >
                픽업 권한 회수
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePickupRoleAction("grant")}
                className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-white transition-colors hover:bg-amber-700"
              >
                픽업 권한 부여
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* 멤버 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">멤버 정보</h3>
                {member.hasPickupRole ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    픽업 권한 있음
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500">
                    픽업 권한 없음
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.userId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.name ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.username ?? "-"}
                </p>
              </div>
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">사업자 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">업체명</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.businessName ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자등록번호</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.businessRegistrationNumber ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">연락처</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.contact ?? "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">픽업 주소</p>
                <p className="text-sm font-medium text-gray-900">
                  {member.pickupAddress ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자 등록일</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(member.businessCreatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자 수정일</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(member.businessUpdatedAt)}
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

- [ ] **Step 5: 테스트 실행 — 통과 확인**

```bash
pnpm test:run 2>&1 | tail -15
```

Expected: 총 25개 테스트 통과.

- [ ] **Step 6: 타입체크**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 7: 커밋**

```bash
git add src/app/admin/businesses/members/[userId]/_components/PickupRoleConfirmModal.tsx \
        src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx \
        src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx
git commit -m "feat: add member detail content with pickup role modal and tests (TDD)"
```

---

## Task 11: 멤버 상세 RSC page.tsx

**Files:**
- Create: `src/app/admin/businesses/members/[userId]/page.tsx`

- [ ] **Step 1: page.tsx 작성**

```typescript
import { getApiAdminBusinessesMembersUserid } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import BusinessMemberDetailContent from "./_components/BusinessMemberDetailContent";

interface BusinessMemberDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function BusinessMemberDetailPage({
  params,
}: BusinessMemberDetailPageProps) {
  const { userId } = await params;
  const token = await getAuthToken();

  try {
    const res = await getApiAdminBusinessesMembersUserid(
      Number(userId),
      withToken(token),
    );

    return <BusinessMemberDetailContent member={res.data} />;
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
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/businesses/members/[userId]/page.tsx
git commit -m "feat: add business member detail RSC page"
```

---

## Task 12: 최종 빌드 및 전체 테스트 검증

- [ ] **Step 1: 전체 테스트 실행**

```bash
pnpm test:run 2>&1
```

Expected:
```
Test Files  4 passed (4)
Tests  25 passed (25)
```

- [ ] **Step 2: ESLint**

```bash
pnpm lint 2>&1 | head -30
```

Expected: 에러 없음. 경고만 있다면 확인 후 넘어간다.

- [ ] **Step 3: 빌드 실행**

```bash
pnpm build 2>&1 | tail -30
```

Expected: 빌드 성공. 에러 없음.

빌드 실패 시 일반적인 원인:
- `AdminHeader`의 `showSearch` prop이 존재하지 않는 경우 → `AdminHeader` 컴포넌트 시그니처 확인 후 prop 이름 수정
- overlay-kit import 경로 문제 → `import { overlay } from "overlay-kit"` 확인

- [ ] **Step 4: 개발 서버에서 수동 확인**

```bash
pnpm dev
```

브라우저에서 확인:
- `http://localhost:3000/admin` → 사이드바에 "사업자 관리" 메뉴 표시
- `http://localhost:3000/admin/businesses` → `/admin/businesses/applications`로 리디렉션
- `http://localhost:3000/admin/businesses/applications` → 신청 목록 테이블 렌더링
- `http://localhost:3000/admin/businesses/applications/1` → 신청 상세 렌더링 (실제 ID 사용)
- PENDING 상태 신청 상세에서 "승인" 클릭 → 승인 모달 표시
- `http://localhost:3000/admin/businesses/members` → 멤버 목록 렌더링
- `http://localhost:3000/admin/businesses/members/1` → 멤버 상세 렌더링 (실제 ID 사용)
- 픽업 권한 없는 멤버 상세에서 "픽업 권한 부여" 클릭 → 확인 모달 표시

---

## Self-Review

**Spec coverage:**
- [x] `getApiAdminBusinessesApplications` → applications/page.tsx (Task 3)
- [x] `getApiAdminBusinessesApplicationsApplicationid` → applications/[applicationId]/page.tsx (Task 7)
- [x] `getApiAdminBusinessesApplicationsApplicationidAuditLogs` → applications/[applicationId]/page.tsx (Task 7)
- [x] `postApiAdminBusinessesApplicationsApplicationidApprove` → actions.ts (Task 4)
- [x] `postApiAdminBusinessesApplicationsApplicationidReject` → actions.ts (Task 4)
- [x] `getApiAdminBusinessesMembers` → members/page.tsx (Task 9)
- [x] `getApiAdminBusinessesMembersUserid` → members/[userId]/page.tsx (Task 11)
- [x] `postApiAdminBusinessesMembersUseridPickupGrant` → actions.ts (Task 9)
- [x] `postApiAdminBusinessesMembersUseridPickupRevoke` → actions.ts (Task 9)
- [x] Admin 사이드바 메뉴 추가 (Task 1)
- [x] TDD — 클라이언트 컴포넌트 4개 모두 테스트 먼저 작성 (Tasks 2, 6, 8, 10)

**Type consistency:**
- `APPLICATION_STATUS_LABEL` / `APPLICATION_STATUS_COLOR` — BusinessApplicationsContent와 BusinessApplicationDetailContent 양쪽에 동일하게 정의됨 (중복이나 별도 constants.ts 없이 인라인 유지)
- `formatDate` — applications/BusinessApplicationsContent, applications/detail, members/detail 각각 인라인 정의 (DRY 위반이나 공유 필요 시 `src/app/admin/businesses/_utils/formatDate.ts`로 추출 가능)
- overlay-kit 모달 props: `isOpen: boolean`, `close: () => void` — 모든 모달에서 동일하게 사용
