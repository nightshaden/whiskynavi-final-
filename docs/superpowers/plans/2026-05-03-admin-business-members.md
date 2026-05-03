# 관리자 사업자 멤버 관리 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/businesses/members` 목록과 `/admin/businesses/members/[userId]` 상세에서 사업자 멤버 조회, 사업자 정보 수정, pickup 권한 부여/회수를 안정적으로 지원한다.

**Architecture:** 조회는 기존 App Router 패턴을 유지해 RSC `page.tsx` 에서 처리하고, 변경은 모두 server action으로 모은다. 상세 페이지는 기존 read-only UI를 유지한 채 같은 화면 안에서 edit mode를 켜서 사업자 정보만 수정한다. 테스트는 `find-password` 작업 패턴을 따라 server action 단위 테스트를 먼저 고정한 뒤, 클라이언트 UI 테스트와 구현을 진행한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Vitest, Testing Library, `@/apis/generated/api` (Orval), `@/apis/errors`, `getAuthToken()` + `withToken()`, shadcn/ui `Badge` / `Input` / `Select` / `Button`, `FormMessage`

---

## 파일 맵

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| 멤버 목록 RSC query 매핑 | `src/app/admin/businesses/members/page.tsx` | 수정 |
| 멤버 목록 UI | `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx` | 수정 |
| 멤버 목록 테스트 | `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx` | 수정 |
| 멤버 상세 server actions | `src/app/admin/businesses/members/[userId]/actions.ts` | 수정 |
| 멤버 상세 action 테스트 | `src/app/admin/businesses/members/[userId]/actions.test.ts` | 신규 |
| 멤버 상세 UI | `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx` | 수정 |
| 멤버 상세 UI 테스트 | `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx` | 수정 |

---

## Task 1: server action 테스트 먼저 추가

`PATCH /business`, `pickup/grant`, `pickup/revoke` 경계를 먼저 테스트로 고정한다. 구현 전에 성공/실패 반환값, 인증 실패 처리, `revalidatePath` 호출 범위를 명확히 한다.

**Files:**
- Create: `src/app/admin/businesses/members/[userId]/actions.test.ts`

- [ ] **Step 1: failing test 작성**

`src/app/admin/businesses/members/[userId]/actions.test.ts` 를 생성한다:

```typescript
import { ApiError } from "@/apis/errors";
import {
  patchApiAdminBusinessesMembersUseridBusiness,
  postApiAdminBusinessesMembersUseridPickupGrant,
  postApiAdminBusinessesMembersUseridPickupRevoke,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  grantPickupRoleAction,
  revokePickupRoleAction,
  updateBusinessAction,
} from "./actions";

vi.mock("@/apis/generated/api", () => ({
  patchApiAdminBusinessesMembersUseridBusiness: vi.fn(),
  postApiAdminBusinessesMembersUseridPickupGrant: vi.fn(),
  postApiAdminBusinessesMembersUseridPickupRevoke: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("@/apis/mutator", () => ({
  withToken: vi.fn(() => ({ headers: { Authorization: "Bearer mocked" } })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockedPatchBusiness = vi.mocked(
  patchApiAdminBusinessesMembersUseridBusiness,
);
const mockedGrantPickup = vi.mocked(
  postApiAdminBusinessesMembersUseridPickupGrant,
);
const mockedRevokePickup = vi.mocked(
  postApiAdminBusinessesMembersUseridPickupRevoke,
);
const mockedGetAuthToken = vi.mocked(getAuthToken);
const mockedWithToken = vi.mocked(withToken);
const mockedRevalidatePath = vi.mocked(revalidatePath);

describe("admin business member actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAuthToken.mockResolvedValue("token");
  });

  it("returns auth error when update is called without token", async () => {
    mockedGetAuthToken.mockResolvedValue(null);

    await expect(
      updateBusinessAction(10, {
        businessName: "테스트 주류",
        businessRegistrationNumber: "123-45-67890",
        businessType: "HOUSEHOLD",
        contact: "010-1234-5678",
        pickupAddress: "서울시 강남구",
      }),
    ).resolves.toEqual({
      success: false,
      error: "인증이 필요합니다.",
    });

    expect(mockedPatchBusiness).not.toHaveBeenCalled();
  });

  it("calls patch api and revalidates both paths on update success", async () => {
    mockedPatchBusiness.mockResolvedValue({
      data: { userId: 10 },
      status: 200,
      headers: new Headers(),
    });

    await expect(
      updateBusinessAction(10, {
        businessName: "수정된 상호",
        businessRegistrationNumber: "123-45-67890",
        businessType: "ENTERTAINMENT",
        contact: "",
        pickupAddress: "서울시 송파구",
      }),
    ).resolves.toEqual({ success: true });

    expect(mockedWithToken).toHaveBeenCalledWith("token");
    expect(mockedPatchBusiness).toHaveBeenCalledWith(
      10,
      {
        businessName: "수정된 상호",
        businessRegistrationNumber: "123-45-67890",
        businessType: "ENTERTAINMENT",
        contact: "",
        pickupAddress: "서울시 송파구",
      },
      { headers: { Authorization: "Bearer mocked" } },
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members/10",
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members",
    );
  });

  it("returns fallback message when update fails unexpectedly", async () => {
    mockedPatchBusiness.mockRejectedValue(new Error("boom"));

    await expect(
      updateBusinessAction(10, {
        businessName: "수정된 상호",
        businessRegistrationNumber: "123-45-67890",
        businessType: "HOUSEHOLD",
        contact: "010-1234-5678",
        pickupAddress: "서울시 강남구",
      }),
    ).resolves.toEqual({
      success: false,
      error: "사업자 정보 수정에 실패했습니다.",
    });
  });

  it("returns backend user message when update api throws ApiError", async () => {
    mockedPatchBusiness.mockRejectedValue(
      new ApiError(400, '{"message":"사업자등록번호 형식이 올바르지 않습니다."}'),
    );

    await expect(
      updateBusinessAction(10, {
        businessName: "수정된 상호",
        businessRegistrationNumber: "invalid",
        businessType: "HOUSEHOLD",
        contact: "010-1234-5678",
        pickupAddress: "서울시 강남구",
      }),
    ).resolves.toEqual({
      success: false,
      error: "사업자등록번호 형식이 올바르지 않습니다.",
    });
  });

  it("calls grant api and revalidates on success", async () => {
    mockedGrantPickup.mockResolvedValue({
      data: {},
      status: 200,
      headers: new Headers(),
    });

    await expect(grantPickupRoleAction(10)).resolves.toEqual({ success: true });

    expect(mockedGrantPickup).toHaveBeenCalledWith(
      10,
      { headers: { Authorization: "Bearer mocked" } },
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members/10",
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members",
    );
  });

  it("calls revoke api and revalidates on success", async () => {
    mockedRevokePickup.mockResolvedValue({
      data: {},
      status: 200,
      headers: new Headers(),
    });

    await expect(revokePickupRoleAction(10)).resolves.toEqual({
      success: true,
    });

    expect(mockedRevokePickup).toHaveBeenCalledWith(
      10,
      { headers: { Authorization: "Bearer mocked" } },
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members/10",
    );
    expect(mockedRevalidatePath).toHaveBeenCalledWith(
      "/admin/businesses/members",
    );
  });
});
```

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/[userId]/actions.test.ts"
```

Expected:

- `updateBusinessAction is not exported`
- 또는 `Cannot find mocked call`
- 최소 1개 이상의 FAIL

- [ ] **Step 3: 커밋**

```bash
git add "src/app/admin/businesses/members/[userId]/actions.test.ts"
git commit -m "test: add business member actions tests"
```

---

## Task 2: 상세 server action 구현

기존 pickup grant/revoke action은 유지하되, 공통 에러 처리와 `updateBusinessAction` 을 추가한다.

**Files:**
- Modify: `src/app/admin/businesses/members/[userId]/actions.ts`

- [ ] **Step 1: actions.ts 구현**

`src/app/admin/businesses/members/[userId]/actions.ts` 를 아래 형태로 정리한다:

```typescript
"use server";

import { getUserErrorMessage } from "@/apis/errors";
import {
  patchApiAdminBusinessesMembersUseridBusiness,
  postApiAdminBusinessesMembersUseridPickupGrant,
  postApiAdminBusinessesMembersUseridPickupRevoke,
  type PatchApiAdminBusinessesMembersUseridBusinessBody,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type BusinessMemberActionResult = {
  success: boolean;
  error?: string;
};

export type UpdateBusinessInput =
  PatchApiAdminBusinessesMembersUseridBusinessBody;

async function getAuthorizedOptions() {
  const token = await getAuthToken();

  if (!token) {
    return null;
  }

  return withToken(token);
}

function revalidateBusinessMemberPaths(userId: number) {
  revalidatePath(`/admin/businesses/members/${userId}`);
  revalidatePath("/admin/businesses/members");
}

export async function updateBusinessAction(
  userId: number,
  input: UpdateBusinessInput,
): Promise<BusinessMemberActionResult> {
  const options = await getAuthorizedOptions();

  if (!options) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await patchApiAdminBusinessesMembersUseridBusiness(userId, input, options);
    revalidateBusinessMemberPaths(userId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getUserErrorMessage(error, "사업자 정보 수정에 실패했습니다."),
    };
  }
}

export async function grantPickupRoleAction(
  userId: number,
): Promise<BusinessMemberActionResult> {
  const options = await getAuthorizedOptions();

  if (!options) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await postApiAdminBusinessesMembersUseridPickupGrant(userId, options);
    revalidateBusinessMemberPaths(userId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getUserErrorMessage(error, "픽업 권한 부여에 실패했습니다."),
    };
  }
}

export async function revokePickupRoleAction(
  userId: number,
): Promise<BusinessMemberActionResult> {
  const options = await getAuthorizedOptions();

  if (!options) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await postApiAdminBusinessesMembersUseridPickupRevoke(userId, options);
    revalidateBusinessMemberPaths(userId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getUserErrorMessage(error, "픽업 권한 회수에 실패했습니다."),
    };
  }
}
```

- [ ] **Step 2: action 테스트를 다시 실행**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/[userId]/actions.test.ts"
```

Expected:

- `6 passed`

- [ ] **Step 3: 커밋**

```bash
git add "src/app/admin/businesses/members/[userId]/actions.ts" \
        "src/app/admin/businesses/members/[userId]/actions.test.ts"
git commit -m "feat: add business member update action"
```

---

## Task 3: 상세 UI 테스트를 edit mode 기준으로 확장

상세 UI가 read-only 와 edit mode 를 모두 지원하도록 테스트를 먼저 늘린다. 이 테스트는 server action 호출 결과 자체가 아니라 모드 전환, 입력 필드, 버튼 표시 책임에만 집중한다.

**Files:**
- Modify: `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx`

- [ ] **Step 1: failing test 작성**

`src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx` 를 아래 형태로 확장한다:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BusinessMemberDetailContent from "./BusinessMemberDetailContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

vi.mock("../actions", () => ({
  updateBusinessAction: vi.fn(),
}));

const mockMember = {
  userId: 10,
  name: "홍길동",
  username: "hong@example.com",
  businessName: "테스트 주류",
  businessRegistrationNumber: "123-45-67890",
  businessType: "HOUSEHOLD" as const,
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

  it("renders business name in read-only mode", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue("테스트 주류"),
    ).not.toBeInTheDocument();
  });

  it("shows grant button when hasPickupRole is false", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("픽업 권한 부여")).toBeInTheDocument();
    expect(screen.queryByText("픽업 권한 회수")).not.toBeInTheDocument();
  });

  it("enters edit mode when clicking 수정", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByDisplayValue("테스트 주류")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("123-45-67890"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("010-1234-5678")).toBeInTheDocument();
    expect(screen.getByDisplayValue("서울시 강남구")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("shows current business type in edit mode", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("combobox")).toHaveValue("HOUSEHOLD");
  });

  it("returns to read-only mode when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByRole("button", { name: "저장" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
  });

  it("hides pickup action while edit mode is active", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.queryByRole("button", { name: "픽업 권한 부여" }),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx"
```

Expected:

- `Unable to find role "button" with name "수정"`
- 최소 1개 이상의 FAIL

- [ ] **Step 3: 커밋**

```bash
git add "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx"
git commit -m "test: cover business member detail edit mode"
```

---

## Task 4: 상세 UI에 edit mode 구현

read-only 상세 UI에 edit mode 를 추가하고, `updateBusinessAction` 과 연결한다. 저장 성공 시 성공 메시지와 함께 read-only 로 복귀하고, 실패 시 입력값을 유지한다.

**Files:**
- Modify: `src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx`

- [ ] **Step 1: edit mode 상태와 저장 로직 구현**

`src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx` 에 다음 구조를 반영한다:

```typescript
"use client";

import type {
  AdminBusinessUserDetailResponse,
  PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType,
} from "@/apis/generated/api";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import { updateBusinessAction } from "../actions";
import { overlay } from "overlay-kit";
import PickupRoleConfirmModal from "./PickupRoleConfirmModal";

type BusinessEditForm = {
  businessName: string;
  businessRegistrationNumber: string;
  businessType: PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType;
  contact: string;
  pickupAddress: string;
};

const BUSINESS_TYPE_OPTIONS = [
  { value: "HOUSEHOLD", label: "가정용" },
  { value: "ENTERTAINMENT", label: "유흥용" },
] as const;

function createInitialForm(
  member: AdminBusinessUserDetailResponse,
): BusinessEditForm {
  return {
    businessName: member.businessName ?? "",
    businessRegistrationNumber: member.businessRegistrationNumber ?? "",
    businessType: member.businessType ?? "HOUSEHOLD",
    contact: member.contact ?? "",
    pickupAddress: member.pickupAddress ?? "",
  };
}

export default function BusinessMemberDetailContent({
  member,
}: {
  member: AdminBusinessUserDetailResponse;
}) {
  const router = useRouter();
  const { toggle } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [form, setForm] = useState<BusinessEditForm>(() =>
    createInitialForm(member),
  );
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    key: keyof BusinessEditForm,
    value: string,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditStart = () => {
    setForm(createInitialForm(member));
    setMessage(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setForm(createInitialForm(member));
    setMessage(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateBusinessAction(member.userId!, {
        businessName: form.businessName,
        businessRegistrationNumber: form.businessRegistrationNumber,
        businessType: form.businessType,
        contact: form.contact,
        pickupAddress: form.pickupAddress,
      });

      if (!result.success) {
        setMessageType("error");
        setMessage(result.error ?? "사업자 정보 수정에 실패했습니다.");
        return;
      }

      setMessageType("success");
      setMessage("사업자 정보를 수정했습니다.");
      setIsEditing(false);
      router.refresh();
    });
  };

  const handlePickupRoleAction = (mode: "grant" | "revoke") => {
    overlay.open((props) => (
      <PickupRoleConfirmModal {...props} userId={member.userId!} mode={mode} />
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

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                type="button"
                onClick={handleEditStart}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                수정
              </button>
            )}
            {!isEditing && member.hasPickupRole ? (
              <button
                type="button"
                onClick={() => handlePickupRoleAction("revoke")}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                픽업 권한 회수
              </button>
            ) : null}
            {!isEditing && !member.hasPickupRole ? (
              <button
                type="button"
                onClick={() => handlePickupRoleAction("grant")}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
              >
                픽업 권한 부여
              </button>
            ) : null}
          </div>
        </div>

        <FormMessage
          message={message}
          variant={messageType}
          className="mb-4"
        />

        <div className="space-y-4">
          {/* 멤버 정보 카드 유지 */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">사업자 정보</h3>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
                {/* 기존 read-only 렌더링 유지 */}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="businessName">업체명</Label>
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(e) =>
                      handleChange("businessName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessRegistrationNumber">
                    사업자등록번호
                  </Label>
                  <Input
                    id="businessRegistrationNumber"
                    value={form.businessRegistrationNumber}
                    onChange={(e) =>
                      handleChange(
                        "businessRegistrationNumber",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">사업자 구분</Label>
                  <select
                    id="businessType"
                    value={form.businessType}
                    onChange={(e) =>
                      handleChange("businessType", e.target.value)
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    {BUSINESS_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="contact">연락처</Label>
                  <Input
                    id="contact"
                    value={form.contact}
                    onChange={(e) => handleChange("contact", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="pickupAddress">픽업 주소</Label>
                  <Input
                    id="pickupAddress"
                    value={form.pickupAddress}
                    onChange={(e) =>
                      handleChange("pickupAddress", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 md:col-span-3">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    disabled={isPending}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: 상세 UI 테스트를 다시 실행**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx"
```

Expected:

- `7 passed`

- [ ] **Step 3: 커밋**

```bash
git add "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx" \
        "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx"
git commit -m "feat: add business member detail edit mode"
```

---

## Task 5: 목록 UI 테스트 보강

현재 목록 UI는 기본 렌더링만 검증한다. 페이지 크기 표시와 정렬 선택 UI, 상세 이동을 테스트로 고정한다.

**Files:**
- Modify: `src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx`

- [ ] **Step 1: failing test 작성**

`src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx` 를 아래 형태로 확장한다:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BusinessMembersContent from "./BusinessMembersContent";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const searchParams = {
  page: "2",
  limit: "20",
  sort: "userId,desc",
};

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
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[
          {
            userId: 10,
            name: "홍길동",
            username: "hong@example.com",
            hasPickupRole: false,
            roles: [],
          },
        ]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("hong@example.com")).toBeInTheDocument();
  });

  it("shows 픽업 권한 있음 badge when hasPickupRole is true", () => {
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[
          {
            userId: 11,
            name: "김철수",
            username: "kim@example.com",
            hasPickupRole: true,
            roles: [],
          },
        ]}
        totalElements={1}
      />,
    );
    expect(screen.getByText("픽업 권한 있음")).toBeInTheDocument();
  });

  it("renders current sort option", () => {
    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[]}
        totalElements={25}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("userId,desc");
  });

  it("pushes a new query when sort is changed", async () => {
    const user = userEvent.setup();

    render(
      <BusinessMembersContent
        searchParams={searchParams}
        members={[]}
        totalElements={25}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "userId,asc",
    );

    expect(push).toHaveBeenCalledWith(
      "/admin/businesses/members?page=1&limit=20&sort=userId%2Casc",
    );
  });
});
```

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx"
```

Expected:

- `Expected element to have value: userId,desc`
- 최소 1개 이상의 FAIL

- [ ] **Step 3: 커밋**

```bash
git add "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx"
git commit -m "test: cover business members list sorting"
```

---

## Task 6: 목록 RSC 와 UI 구현 보강

목록은 기존 페이지네이션을 유지하고, `sort` query 를 서버 fetch와 클라이언트 UI에 연결한다.

**Files:**
- Modify: `src/app/admin/businesses/members/page.tsx`
- Modify: `src/app/admin/businesses/members/_components/BusinessMembersContent.tsx`

- [ ] **Step 1: RSC에 sort query 매핑 추가**

`src/app/admin/businesses/members/page.tsx` 를 아래처럼 수정한다:

```typescript
import { getApiAdminBusinessesMembers } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import BusinessMembersContent from "./_components/BusinessMembersContent";

interface BusinessMembersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sort?: string;
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
      sort: params.sort ? [params.sort] : undefined,
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

- [ ] **Step 2: 목록 UI에 sort selector 추가**

`src/app/admin/businesses/members/_components/BusinessMembersContent.tsx` 에 다음 변경을 반영한다:

```typescript
"use client";

import type { AdminBusinessUserResponse } from "@/apis/generated/api";
import AdminHeader from "@/app/admin/_components/AdminHeader";
import { useSidebar } from "@/app/admin/_components/AdminLayoutClient";
import Pagination from "@/app/admin/_components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "userId,desc", label: "최신 등록순" },
  { value: "userId,asc", label: "오래된 등록순" },
] as const;

interface BusinessMembersContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
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
  const currentSort = searchParams.sort || "userId,desc";

  const buildParams = () => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params;
  };

  const handleSortChange = (value: string) => {
    const params = buildParams();
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/admin/businesses/members?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="사업자 멤버 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">총 {totalElements}건</p>
          <div className="flex items-center gap-2">
            <label htmlFor="member-sort" className="text-sm text-gray-600">
              정렬
            </label>
            <select
              id="member-sort"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 기존 테이블 렌더링 유지 */}

        <Pagination
          totalItems={totalElements}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          searchParams={searchParams}
          basePath="/admin/businesses/members"
        />
      </div>
    </>
  );
}
```

- [ ] **Step 3: 목록 테스트를 다시 실행**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx"
```

Expected:

- `7 passed`

- [ ] **Step 4: 커밋**

```bash
git add "src/app/admin/businesses/members/page.tsx" \
        "src/app/admin/businesses/members/_components/BusinessMembersContent.tsx" \
        "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx"
git commit -m "feat: add sorting support to business members list"
```

---

## Task 7: 최종 검증

각 레이어 테스트가 모두 통과하는지 확인하고, 타입체크와 린트까지 실행해 마무리한다.

**Files:**
- Verify only

- [ ] **Step 1: 관련 테스트 전체 실행**

Run:

```bash
pnpm test:run -- "src/app/admin/businesses/members/[userId]/actions.test.ts" \
                 "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx" \
                 "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx"
```

Expected:

- `3 files passed`

- [ ] **Step 2: 타입체크**

Run:

```bash
pnpm tsc --noEmit
```

Expected:

- 출력 없음

- [ ] **Step 3: 린트**

Run:

```bash
pnpm lint
```

Expected:

- `No ESLint warnings or errors`

- [ ] **Step 4: 최종 커밋**

```bash
git add "src/app/admin/businesses/members/page.tsx" \
        "src/app/admin/businesses/members/_components/BusinessMembersContent.tsx" \
        "src/app/admin/businesses/members/_components/BusinessMembersContent.test.tsx" \
        "src/app/admin/businesses/members/[userId]/actions.ts" \
        "src/app/admin/businesses/members/[userId]/actions.test.ts" \
        "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.tsx" \
        "src/app/admin/businesses/members/[userId]/_components/BusinessMemberDetailContent.test.tsx"
git commit -m "feat: complete admin business member management"
```

---

## 스펙 커버리지 점검

- 목록 페이지네이션 유지: Task 6
- 목록 query 기반 조회 유지: Task 6
- 상세 read-only + edit mode: Task 3, Task 4
- PATCH `/business`: Task 1, Task 2, Task 4
- pickup grant/revoke 유지: Task 1, Task 2, Task 4
- GET 은 RSC / PATCH·POST 는 server action: Task 2, Task 6
- server action 단위 테스트: Task 1, Task 2
- 클라이언트 UI 테스트: Task 3, Task 5

누락된 스펙 요구는 없다.

## Placeholder 점검

- `TODO`, `TBD`, “적절히 처리” 같은 placeholder 없음
- 모든 코드 단계에 실제 코드 조각 포함
- 모든 검증 단계에 실행 명령과 기대 결과 포함

## 타입 일관성 점검

- action 반환 타입은 `BusinessMemberActionResult` 로 일관
- 수정 payload는 `UpdateBusinessInput` / `PatchApiAdminBusinessesMembersUseridBusinessBody` 기준으로 일관
- 상세 폼 타입은 `BusinessEditForm` 으로 고정
- 목록 query key 는 `page`, `limit`, `sort` 로 일관
