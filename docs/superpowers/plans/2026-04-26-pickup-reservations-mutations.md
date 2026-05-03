# Pickup Reservations Mutations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/pickup-reservations` 리스트/상세 페이지에 상태 전환 mutation 기능을 추가한다 (결제완료·픽업대기·수령완료 처리 + 일괄 픽업대기 처리).

**Architecture:** Server Actions(`actions.ts`)으로 POST API 4개를 래핑하고, 상세 페이지에 상태별 액션 버튼 + 확인 Dialog, 리스트 페이지에 체크박스 + 일괄 처리 버튼을 추가한다. 각 Server Action은 `revalidatePath`로 RSC 캐시를 무효화하고, 클라이언트는 `router.refresh()`로 UI를 갱신한다.

**Tech Stack:** Next.js 15 App Router Server Actions, TypeScript strict, shadcn/ui Dialog + Checkbox + Button, `sonner` toast, `useTransition`, `@/apis/generated/api` (Orval 생성)

**Precondition:** `2026-04-26-pickup-reservations-pages.md` 계획이 완료되어 아래 파일들이 존재해야 한다:
- `src/app/admin/pickup-reservations/page.tsx`
- `src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx`
- `src/app/admin/pickup-reservations/[applicationId]/page.tsx`
- `src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`

---

## 상태 전환 흐름

```
CONFIRMED → [결제완료 처리] → PAYMENT_COMPLETED
PAYMENT_COMPLETED → [픽업대기 처리] → WAITING_PICKUP   (단건 또는 일괄)
WAITING_PICKUP → [수령완료 처리] → RECEIVED
```

## File Map

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| Server Actions | `src/app/admin/pickup-reservations/actions.ts` | 신규 |
| 상태 액션 섹션 | `src/app/admin/pickup-reservations/[applicationId]/_components/StatusActionSection.tsx` | 신규 |
| 상세 컴포넌트 | `src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx` | 수정 |
| 리스트 컴포넌트 | `src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx` | 수정 |

---

## Task 1: Server Actions 작성

**Files:**
- Create: `src/app/admin/pickup-reservations/actions.ts`

- [ ] **Step 1: actions.ts 작성**

`src/app/admin/pickup-reservations/actions.ts`를 생성한다:

```typescript
"use server";

import {
  postApiUsersBusinessesPickupReservationsApplicationsApplicationidPaymentComplete,
  postApiUsersBusinessesPickupReservationsApplicationsApplicationidReceiveComplete,
  postApiUsersBusinessesPickupReservationsApplicationsApplicationidWaitingPickup,
  postApiUsersBusinessesPickupReservationsApplicationsWaitingPickup,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: boolean; error?: string };

export async function paymentCompleteAction(
  applicationId: number,
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiUsersBusinessesPickupReservationsApplicationsApplicationidPaymentComplete(
      applicationId,
      withToken(token),
    );
    revalidatePath("/admin/pickup-reservations");
    revalidatePath(`/admin/pickup-reservations/${applicationId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "결제완료 처리에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function waitingPickupAction(
  applicationId: number,
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiUsersBusinessesPickupReservationsApplicationsApplicationidWaitingPickup(
      applicationId,
      withToken(token),
    );
    revalidatePath("/admin/pickup-reservations");
    revalidatePath(`/admin/pickup-reservations/${applicationId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "픽업대기 처리에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function receiveCompleteAction(
  applicationId: number,
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiUsersBusinessesPickupReservationsApplicationsApplicationidReceiveComplete(
      applicationId,
      withToken(token),
    );
    revalidatePath("/admin/pickup-reservations");
    revalidatePath(`/admin/pickup-reservations/${applicationId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "수령완료 처리에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function bulkWaitingPickupAction(
  applicationIds: number[],
): Promise<ActionResult> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiUsersBusinessesPickupReservationsApplicationsWaitingPickup(
      { applicationIds },
      withToken(token),
    );
    revalidatePath("/admin/pickup-reservations");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "일괄 픽업대기 처리에 실패했습니다.";
    return { success: false, error: message };
  }
}
```

- [ ] **Step 2: 타입체크**

```bash
cd /Users/morrison.k/Documents/study/app-router-with-claude
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/admin/pickup-reservations/actions.ts
git commit -m "feat: add server actions for pickup reservation status mutations"
```

---

## Task 2: StatusActionSection 컴포넌트 생성

상세 페이지에서 현재 `status`에 따라 적절한 전환 버튼 하나만 렌더링하고, 클릭 시 확인 Dialog를 표시한다.

**Files:**
- Create: `src/app/admin/pickup-reservations/[applicationId]/_components/StatusActionSection.tsx`

- [ ] **Step 1: StatusActionSection.tsx 작성**

`src/app/admin/pickup-reservations/[applicationId]/_components/StatusActionSection.tsx`를 생성한다:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  paymentCompleteAction,
  receiveCompleteAction,
  waitingPickupAction,
} from "../actions";

type ActionType = "payment-complete" | "waiting-pickup" | "receive-complete";

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string;
    confirmLabel: string;
    className: string;
    description: string;
  }
> = {
  "payment-complete": {
    label: "결제완료 처리",
    confirmLabel: "결제완료 확인",
    className: "bg-cyan-600 text-white hover:bg-cyan-700",
    description: "이 신청을 결제완료 상태로 변경합니다.",
  },
  "waiting-pickup": {
    label: "픽업대기 처리",
    confirmLabel: "픽업대기 확인",
    className: "bg-amber-600 text-white hover:bg-amber-700",
    description: "이 신청을 픽업대기 상태로 변경합니다.",
  },
  "receive-complete": {
    label: "수령완료 처리",
    confirmLabel: "수령완료 확인",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
    description: "이 신청을 수령완료 상태로 변경합니다.",
  },
};

const STATUS_TO_ACTION: Record<string, ActionType> = {
  CONFIRMED: "payment-complete",
  PAYMENT_COMPLETED: "waiting-pickup",
  WAITING_PICKUP: "receive-complete",
};

interface StatusActionSectionProps {
  applicationId: number;
  status?: string;
  applicantName?: string;
}

export default function StatusActionSection({
  applicationId,
  status,
  applicantName,
}: StatusActionSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actionType = status ? STATUS_TO_ACTION[status] : undefined;
  if (!actionType) return null;

  const config = ACTION_CONFIG[actionType];

  const handleConfirm = () => {
    startTransition(async () => {
      let result: { success: boolean; error?: string };

      if (actionType === "payment-complete") {
        result = await paymentCompleteAction(applicationId);
      } else if (actionType === "waiting-pickup") {
        result = await waitingPickupAction(applicationId);
      } else {
        result = await receiveCompleteAction(applicationId);
      }

      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "처리에 실패했습니다.");
      }
    });
  };

  return (
    <>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className={config.className}
        >
          {config.label}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config.label}</DialogTitle>
            <DialogDescription>
              {applicantName && <strong>{applicantName}</strong>}님의 신청을{" "}
              {config.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className={config.className}
            >
              {isPending ? "처리 중..." : config.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
git add src/app/admin/pickup-reservations/[applicationId]/_components/StatusActionSection.tsx
git commit -m "feat: add StatusActionSection for pickup reservation status transitions"
```

---

## Task 3: 상세 페이지에 StatusActionSection 통합

기존 계획(Task 4)에서 생성된 `PickupApplicationDetailContent.tsx`에 `StatusActionSection`을 추가한다.

**Files:**
- Modify: `src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx`

- [ ] **Step 1: import 추가**

`PickupApplicationDetailContent.tsx` 파일 상단 import에 `StatusActionSection`을 추가한다:

```typescript
// 기존 import들 다음에 추가
import StatusActionSection from "./StatusActionSection";
```

- [ ] **Step 2: StatusActionSection 삽입**

`<div className="space-y-6">` 바로 앞, 즉 뒤로가기 버튼 다음에 `StatusActionSection`을 추가한다:

```tsx
{/* 기존 뒤로가기 버튼 div 다음 위치 */}
<div className="space-y-6">
  {/* StatusActionSection 추가 — space-y-6 첫 번째 항목으로 */}
  <StatusActionSection
    applicationId={application.id!}
    status={application.status}
    applicantName={application.applicantUser?.name ?? undefined}
  />

  {/* 병 정보 */}
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
    ...
  </div>
  {/* 나머지 카드들은 그대로 유지 */}
```

완성된 `<div className="p-8">` 내부 구조:

```tsx
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
    <StatusActionSection
      applicationId={application.id!}
      status={application.status}
      applicantName={application.applicantUser?.name ?? undefined}
    />

    {/* 병 정보 */}
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      ...기존 병 정보 카드 그대로...
    </div>

    {/* 신청 정보 */}
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      ...기존 신청 정보 카드 그대로...
    </div>

    {/* 신청자 정보 */}
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      ...기존 신청자 정보 카드 그대로...
    </div>
  </div>
</div>
```

- [ ] **Step 3: 타입체크 & 린트**

```bash
pnpm tsc --noEmit 2>&1 | head -30
pnpm lint 2>&1 | head -30
```

Expected: 에러 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/app/admin/pickup-reservations/[applicationId]/_components/PickupApplicationDetailContent.tsx
git commit -m "feat: integrate StatusActionSection into pickup application detail page"
```

---

## Task 4: 리스트 페이지 체크박스 + 일괄 픽업대기 처리

`PickupReservationsContent.tsx`에 체크박스 선택 + 일괄 픽업대기 처리 기능을 추가한다. `PAYMENT_COMPLETED` 상태인 항목만 선택 가능하다.

**Files:**
- Modify: `src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx`

- [ ] **Step 1: 완전히 수정된 PickupReservationsContent.tsx 작성**

기존 파일의 `"use client";` 바로 아래 import 블록에 추가:

```typescript
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bulkWaitingPickupAction } from "../actions";
```

컴포넌트 내부, `useSidebar` / `router` / `useTableFilter` 훅 호출 다음에 state 추가:

```typescript
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
const [isPending, startTransition] = useTransition();
```

헬퍼 함수들 추가 (컴포넌트 내부, return 전):

```typescript
const paymentCompletedApps = applications.filter(
  (app) => app.status === "PAYMENT_COMPLETED",
);

const toggleSelect = (id: number) => {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
};

const toggleSelectAll = () => {
  if (selectedIds.size === paymentCompletedApps.length && paymentCompletedApps.length > 0) {
    setSelectedIds(new Set());
  } else {
    setSelectedIds(new Set(paymentCompletedApps.map((app) => app.id!)));
  }
};

const isAllSelected =
  paymentCompletedApps.length > 0 &&
  paymentCompletedApps.every((app) => selectedIds.has(app.id!));

const handleBulkWaitingPickup = () => {
  startTransition(async () => {
    const result = await bulkWaitingPickupAction([...selectedIds]);
    if (result.success) {
      setSelectedIds(new Set());
      setIsBulkDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "일괄 처리에 실패했습니다.");
    }
  });
};
```

- [ ] **Step 2: 일괄 처리 버튼 + Dialog UI 추가**

`<div className="mb-4 flex items-center justify-between">` 내부를 수정한다:

```tsx
<div className="mb-4 flex items-center justify-between">
  <p className="text-sm text-gray-600">총 {totalElements}건</p>

  {selectedIds.size > 0 && (
    <Button
      type="button"
      onClick={() => setIsBulkDialogOpen(true)}
      className="bg-amber-600 text-white hover:bg-amber-700"
    >
      일괄 픽업대기 처리 ({selectedIds.size}건)
    </Button>
  )}
</div>

<Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>일괄 픽업대기 처리</DialogTitle>
      <DialogDescription>
        선택한 <strong>{selectedIds.size}건</strong>의 신청을 픽업대기
        상태로 변경합니다.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsBulkDialogOpen(false)}
        disabled={isPending}
      >
        취소
      </Button>
      <Button
        onClick={handleBulkWaitingPickup}
        disabled={isPending}
        className="bg-amber-600 text-white hover:bg-amber-700"
      >
        {isPending ? "처리 중..." : "픽업대기 확인"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

- [ ] **Step 3: 테이블 헤더에 체크박스 열 추가**

`<thead>` 내부 `<tr>` 첫 번째 `<th>` 앞에 체크박스 열을 추가한다:

```tsx
<thead className="border-b border-gray-200 bg-gray-50" ref={filterRef}>
  <tr>
    {/* 체크박스 열 추가 */}
    <th className="w-10 px-4 py-3">
      <Checkbox
        checked={isAllSelected}
        onCheckedChange={toggleSelectAll}
        disabled={paymentCompletedApps.length === 0}
        aria-label="전체 선택"
      />
    </th>
    <th className="typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase">
      ID
    </th>
    {/* 나머지 th들 그대로 유지 */}
```

`colSpan` 수정 (빈 상태 row): 8 → 9

```tsx
<td colSpan={9} className="px-4 py-8 text-center text-gray-500">
  픽업 예약 신청이 없습니다.
</td>
```

- [ ] **Step 4: 테이블 바디에 체크박스 열 추가**

각 행(`<tr key={app.id}>`) 내부 첫 번째 `<td>` 앞에 체크박스 셀을 추가한다:

```tsx
<tr
  key={app.id}
  className="cursor-pointer transition-colors hover:bg-gray-50"
  onClick={() => router.push(`/admin/pickup-reservations/${app.id}`)}
>
  {/* 체크박스 셀 추가 */}
  <td
    className="w-10 px-4 py-3"
    onClick={(e) => e.stopPropagation()}
  >
    {app.status === "PAYMENT_COMPLETED" && (
      <Checkbox
        checked={selectedIds.has(app.id!)}
        onCheckedChange={() => toggleSelect(app.id!)}
        aria-label={`${app.id} 선택`}
      />
    )}
  </td>
  <td className="px-4 py-3 text-sm text-gray-900">{app.id}</td>
  {/* 나머지 td들 그대로 유지 */}
```

- [ ] **Step 5: 타입체크 & 린트**

```bash
pnpm tsc --noEmit 2>&1 | head -50
pnpm lint 2>&1 | head -50
```

Expected: 에러 없음.

`Checkbox`의 `onCheckedChange` 타입이 `(checked: boolean | 'indeterminate') => void`이므로 `toggleSelectAll`의 시그니처가 맞지 않으면:

```typescript
// 변경 전
const toggleSelectAll = () => { ... }

// 변경 후 (onCheckedChange 콜백 시그니처 맞추기)
const handleSelectAll = (_checked: boolean | "indeterminate") => {
  toggleSelectAll();
};

// JSX에서
<Checkbox onCheckedChange={handleSelectAll} ... />
```

- [ ] **Step 6: 커밋**

```bash
git add src/app/admin/pickup-reservations/_components/PickupReservationsContent.tsx
git commit -m "feat: add bulk waiting-pickup selection to pickup reservations list"
```

---

## Task 5: 최종 빌드 검증

- [ ] **Step 1: 전체 빌드 실행**

```bash
pnpm build 2>&1 | tail -30
```

Expected: 빌드 성공. 에러 없음.

- [ ] **Step 2: 동작 확인 체크리스트**

개발 서버(`pnpm dev`) 실행 후 브라우저에서 확인:

- [ ] 상세 페이지(`/admin/pickup-reservations/{id}`) — `CONFIRMED` 상태 항목: "결제완료 처리" 버튼 표시
- [ ] 상세 페이지 — `PAYMENT_COMPLETED` 상태 항목: "픽업대기 처리" 버튼 표시
- [ ] 상세 페이지 — `WAITING_PICKUP` 상태 항목: "수령완료 처리" 버튼 표시
- [ ] 상세 페이지 — `RECEIVED`/`CANCELLED`/`APPLIED`/`REJECTED` 상태: 버튼 없음
- [ ] 각 버튼 클릭 시 확인 Dialog 표시
- [ ] Dialog에서 확인 클릭 → API 호출 → 상태 변경 후 페이지 갱신
- [ ] 리스트 페이지 — `PAYMENT_COMPLETED` 행에만 체크박스 표시
- [ ] 전체 선택 체크박스가 `PAYMENT_COMPLETED` 행만 선택
- [ ] 항목 선택 시 "일괄 픽업대기 처리 (N건)" 버튼 표시
- [ ] 일괄 처리 확인 후 선택 초기화 + 리스트 갱신

---

## Self-Review Checklist

- [x] 4개 POST API 모두 Server Action으로 커버됨
  - `payment-complete` (CONFIRMED → PAYMENT_COMPLETED)
  - `waiting-pickup` single (PAYMENT_COMPLETED → WAITING_PICKUP)
  - `receive-complete` (WAITING_PICKUP → RECEIVED)
  - `waiting-pickup` bulk (`applicationIds[]`)
- [x] `revalidatePath` 호출: 리스트 + 상세 경로 모두 무효화
- [x] `router.refresh()` 패턴 사용 (기존 코드베이스와 일관성)
- [x] 인증 없을 시 early return (`{ success: false, error: "인증이 필요합니다." }`)
- [x] 체크박스 클릭 시 행 클릭 이벤트 버블링 차단 (`e.stopPropagation()`)
- [x] `colSpan` 8 → 9 로 업데이트 (체크박스 열 추가분)
- [x] `Checkbox.onCheckedChange` 타입 대응 처리 포함
- [x] Placeholder 없음: 모든 step에 실제 코드 포함
