# 비밀번호 초기화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 화면의 `비밀번호 초기화` 링크를 실제 동작하는 단일 페이지 비밀번호 초기화 플로우로 구현한다.

**Architecture:** `src/app/(main)/find-password` 아래에 public route를 추가하고, 서버 액션이 reset 인증코드 발송과 인증코드 검증 후 임시 비밀번호 발급을 담당한다. UI는 클라이언트 컴포넌트 하나에서 `idle → code-sent → resetting → completed` 상태를 관리하며, 검증 성공 직후 자동으로 reset API를 호출한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Zod, Vitest, Testing Library, Tailwind CSS 4, `@/apis/generated/api`

---

## 파일 맵

| 역할 | 경로 | 신규/수정 |
|------|------|---------|
| 비밀번호 초기화 서버 액션 | `src/app/(main)/find-password/actions.ts` | 신규 |
| 서버 액션 테스트 | `src/app/(main)/find-password/actions.test.ts` | 신규 |
| 비밀번호 초기화 페이지 RSC | `src/app/(main)/find-password/page.tsx` | 신규 |
| 비밀번호 초기화 폼 UI | `src/app/(main)/find-password/_components/FindPasswordForm.tsx` | 신규 |
| 폼 컴포넌트 테스트 | `src/app/(main)/find-password/_components/FindPasswordForm.test.tsx` | 신규 |

---

## Task 1: 서버 액션 테스트 먼저 추가

서버 액션 경계를 먼저 고정한다. 이 단계에서는 public API 세 개를 어떤 순서와 fallback 메시지로 호출해야 하는지 테스트로 확정한다.

**Files:**
- Create: `src/app/(main)/find-password/actions.test.ts`

- [ ] **Step 1: 서버 액션 테스트 파일 작성**

`src/app/(main)/find-password/actions.test.ts`를 생성한다:

```typescript
import { ApiError } from "@/apis/errors";
import {
  postApiAuthEmailVerificationResetSend,
  postApiAuthEmailVerificationResetVerify,
  postApiAuthResetPassword,
} from "@/apis/generated/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendResetCode, verifyAndResetPassword } from "./actions";

vi.mock("@/apis/generated/api", () => ({
  postApiAuthEmailVerificationResetSend: vi.fn(),
  postApiAuthEmailVerificationResetVerify: vi.fn(),
  postApiAuthResetPassword: vi.fn(),
}));

const mockedSend = vi.mocked(postApiAuthEmailVerificationResetSend);
const mockedVerify = vi.mocked(postApiAuthEmailVerificationResetVerify);
const mockedReset = vi.mocked(postApiAuthResetPassword);

describe("find-password actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is empty", async () => {
    await expect(sendResetCode("")).resolves.toEqual({
      success: false,
      error: "올바른 이메일 형식이 아닙니다.",
    });
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("returns success when reset code send succeeds", async () => {
    mockedSend.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

    await expect(sendResetCode("user@example.com")).resolves.toEqual({ success: true });
    expect(mockedSend).toHaveBeenCalledWith({ email: "user@example.com" });
  });

  it("returns unknown-email message when backend rejects unregistered email", async () => {
    mockedSend.mockRejectedValue(new ApiError(404, '{"message":"가입되지 않은 이메일입니다"}'));

    await expect(sendResetCode("ghost@example.com")).resolves.toEqual({
      success: false,
      error: "가입되지 않은 이메일입니다",
    });
  });

  it("returns validation error when verification code is empty", async () => {
    await expect(verifyAndResetPassword("user@example.com", "")).resolves.toEqual({
      success: false,
      error: "인증 코드를 입력해주세요.",
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("verifies first and resets password second", async () => {
    mockedVerify.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });
    mockedReset.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

    await expect(verifyAndResetPassword("user@example.com", "123456")).resolves.toEqual({ success: true });

    expect(mockedVerify).toHaveBeenCalledWith({
      email: "user@example.com",
      code: "123456",
    });
    expect(mockedReset).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(mockedVerify.mock.invocationCallOrder[0]).toBeLessThan(mockedReset.mock.invocationCallOrder[0]);
  });

  it("does not reset password when verification fails", async () => {
    mockedVerify.mockRejectedValue(new ApiError(400, '{"message":"인증 코드가 올바르지 않습니다."}'));

    await expect(verifyAndResetPassword("user@example.com", "999999")).resolves.toEqual({
      success: false,
      error: "인증 코드가 올바르지 않습니다.",
    });
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("returns reset fallback when verification succeeds but reset fails", async () => {
    mockedVerify.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });
    mockedReset.mockRejectedValue(new ApiError(500, '{"message":"temporary failure"}'));

    await expect(verifyAndResetPassword("user@example.com", "123456")).resolves.toEqual({
      success: false,
      error: "임시 비밀번호 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인**

Run:

```bash
cd /Users/morrison.k/Documents/study/app-router-with-claude
pnpm test:run -- "src/app/(main)/find-password/actions.test.ts"
```

Expected:

- `Cannot find module './actions'`
- 또는 `sendResetCode is not exported`
- 최소 1개 이상의 FAIL

- [ ] **Step 3: 커밋**

```bash
git add "src/app/(main)/find-password/actions.test.ts"
git commit -m "test: add find-password server action tests"
```

---

## Task 2: 서버 액션 구현

이 단계에서 입력 검증, API 호출 순서, 가입되지 않은 이메일 메시지 유지, verify 성공 후 reset 자동 실행을 구현한다.

**Files:**
- Create: `src/app/(main)/find-password/actions.ts`

- [ ] **Step 1: 서버 액션 구현**

`src/app/(main)/find-password/actions.ts`를 생성한다:

```typescript
"use server";

import { getUserErrorMessage } from "@/apis/errors";
import {
  postApiAuthEmailVerificationResetSend,
  postApiAuthEmailVerificationResetVerify,
  postApiAuthResetPassword,
} from "@/apis/generated/api";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { emailSchema } from "../sign-up/schemas";

export type FindPasswordActionResult = {
  success: boolean;
  error?: string;
};

const sendResetCodeSchema = z.object({
  email: emailSchema,
});

const verifyAndResetSchema = z.object({
  email: emailSchema,
  code: z.string().trim().min(1, "인증 코드를 입력해주세요."),
});

const UNKNOWN_EMAIL_MESSAGE = "가입되지 않은 이메일입니다";

function normalizeFindPasswordError(error: unknown, fallback: string): string {
  const message = getUserErrorMessage(error, fallback);

  if (message.includes("가입되지 않은 이메일")) {
    return UNKNOWN_EMAIL_MESSAGE;
  }

  return message;
}

export async function sendResetCode(email: string): Promise<FindPasswordActionResult> {
  try {
    const parsed = sendResetCodeSchema.safeParse({ email });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "올바른 이메일 형식이 아닙니다.",
      };
    }

    await postApiAuthEmailVerificationResetSend({ email: parsed.data.email });

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      error: normalizeFindPasswordError(error, "인증 코드 발송에 실패했습니다."),
    };
  }
}

export async function verifyAndResetPassword(email: string, code: string): Promise<FindPasswordActionResult> {
  try {
    const parsed = verifyAndResetSchema.safeParse({ email, code });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "인증 코드를 입력해주세요.",
      };
    }

    await postApiAuthEmailVerificationResetVerify({
      email: parsed.data.email,
      code: parsed.data.code,
    });

    try {
      await postApiAuthResetPassword({ email: parsed.data.email });
    } catch (error) {
      if (isRedirectError(error)) throw error;

      return {
        success: false,
        error: "임시 비밀번호 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      error: normalizeFindPasswordError(error, "인증 코드가 올바르지 않습니다."),
    };
  }
}
```

- [ ] **Step 2: 서버 액션 테스트 재실행**

Run:

```bash
pnpm test:run -- "src/app/(main)/find-password/actions.test.ts"
```

Expected:

- `7 passed`
- `FAIL` 없음

- [ ] **Step 3: 타입체크**

Run:

```bash
pnpm tsc --noEmit
```

Expected:

- TypeScript 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add "src/app/(main)/find-password/actions.ts" "src/app/(main)/find-password/actions.test.ts"
git commit -m "feat: add find-password server actions"
```

---

## Task 3: 폼 컴포넌트 테스트 추가

이 단계에서는 사용자 입장에서 중요한 상태 전환을 먼저 테스트로 고정한다. 서버 액션은 mock으로 대체하고, 폼이 어떤 문구와 버튼 상태를 보여야 하는지 검증한다.

**Files:**
- Create: `src/app/(main)/find-password/_components/FindPasswordForm.test.tsx`

- [ ] **Step 1: 폼 테스트 파일 작성**

`src/app/(main)/find-password/_components/FindPasswordForm.test.tsx`를 생성한다:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FindPasswordForm from "./FindPasswordForm";

const mockSendResetCode = vi.fn();
const mockVerifyAndResetPassword = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("../actions", () => ({
  sendResetCode: (...args: unknown[]) => mockSendResetCode(...args),
  verifyAndResetPassword: (...args: unknown[]) => mockVerifyAndResetPassword(...args),
}));

describe("FindPasswordForm", () => {
  it("reveals verification input after send succeeds", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));

    expect(await screen.findByPlaceholderText("인증 코드 입력")).toBeInTheDocument();
    expect(screen.getByText("인증 코드가 발송되었습니다. 이메일을 확인해주세요.")).toBeInTheDocument();
  });

  it("shows backend error when email is not registered", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({
      success: false,
      error: "가입되지 않은 이메일입니다",
    });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "ghost@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));

    expect(await screen.findByText("가입되지 않은 이메일입니다")).toBeInTheDocument();
  });

  it("shows verification error and stays on code step when verification fails", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });
    mockVerifyAndResetPassword.mockResolvedValue({
      success: false,
      error: "인증 코드가 올바르지 않습니다.",
    });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));
    await user.type(await screen.findByPlaceholderText("인증 코드 입력"), "999999");
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(await screen.findByText("인증 코드가 올바르지 않습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("shows completion state after verify succeeds and reset runs automatically", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });
    mockVerifyAndResetPassword.mockResolvedValue({ success: true });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));
    await user.type(await screen.findByPlaceholderText("인증 코드 입력"), "123456");
    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.getByText("임시 비밀번호를 이메일로 발송했습니다.")).toBeInTheDocument();
    });

    expect(mockVerifyAndResetPassword).toHaveBeenCalledWith("user@example.com", "123456");
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute("href", "/sign-in");
  });
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인**

Run:

```bash
pnpm test:run -- "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx"
```

Expected:

- `Cannot find module './FindPasswordForm'`
- 또는 렌더링 관련 FAIL

- [ ] **Step 3: 커밋**

```bash
git add "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx"
git commit -m "test: add find-password form tests"
```

---

## Task 4: 페이지와 폼 구현

폼 구현은 Task 3 테스트를 통과시키는 최소 동작만 먼저 넣고, 페이지는 sign-in 레이아웃과 유사한 쉘을 제공한다.

**Files:**
- Create: `src/app/(main)/find-password/page.tsx`
- Create: `src/app/(main)/find-password/_components/FindPasswordForm.tsx`
- Test: `src/app/(main)/find-password/_components/FindPasswordForm.test.tsx`

- [ ] **Step 1: FindPasswordForm 컴포넌트 구현**

`src/app/(main)/find-password/_components/FindPasswordForm.tsx`를 생성한다:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { sendResetCode, verifyAndResetPassword } from "../actions";

type FindPasswordStep = "idle" | "code-sent" | "resetting" | "completed";

export default function FindPasswordForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<FindPasswordStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextEmail = e.target.value;
      setEmail(nextEmail);

      if (step === "code-sent" || step === "resetting") {
        setStep("idle");
        setCode("");
        setError(null);
      }
    },
    [step],
  );

  const handleSendCode = useCallback(() => {
    setError(null);

    startTransition(async () => {
      const result = await sendResetCode(email.trim());

      if (!result.success) {
        setStep("idle");
        setError(result.error ?? "인증 코드 발송에 실패했습니다.");
        return;
      }

      setStep("code-sent");
      setCode("");
    });
  }, [email]);

  const handleVerifyCode = useCallback(() => {
    setError(null);
    setStep("resetting");

    startTransition(async () => {
      const result = await verifyAndResetPassword(email.trim(), code.trim());

      if (!result.success) {
        setStep("code-sent");
        setError(result.error ?? "인증 코드가 올바르지 않습니다.");
        return;
      }

      setStep("completed");
    });
  }, [email, code]);

  if (step === "completed") {
    return (
      <div className="mt-6 w-full">
        <FormMessage
          message="임시 비밀번호를 이메일로 발송했습니다."
          variant="success"
          className="text-center"
        />
        <Link
          href="/sign-in"
          className="typo-medium-16 mt-6 block w-full text-center font-semibold text-white underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="typo-medium-13 block font-semibold text-white">
            이메일 주소
          </Label>
          <div className="mt-2 flex items-end gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              readOnly={step === "resetting"}
              placeholder="ex) whiskynavi@whiskynavi.com"
              className="typo-medium-13 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 font-semibold text-white placeholder:text-gray-200 focus-visible:border-white focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={isPending || step === "code-sent" || step === "resetting"}
              className="shrink-0 border border-white/30 bg-white text-black disabled:opacity-50"
            >
              {isPending && step === "idle" ? "발송 중..." : step === "code-sent" ? "발송완료" : "인증코드 발송"}
            </Button>
          </div>
        </div>

        {(step === "code-sent" || step === "resetting") && (
          <div>
            <Label htmlFor="verification-code" className="typo-medium-13 block font-semibold text-white">
              인증 코드
            </Label>
            <div className="mt-2 flex items-end gap-2">
              <Input
                id="verification-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                readOnly={step === "resetting"}
                placeholder="인증 코드 입력"
                className="typo-medium-13 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 font-semibold text-white placeholder:text-gray-200 focus-visible:border-white focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVerifyCode}
                disabled={isPending || !code.trim()}
                className="shrink-0 border border-white/30 bg-white text-black disabled:opacity-50"
              >
                {step === "resetting" ? "처리 중..." : "확인"}
              </Button>
            </div>
            {step === "code-sent" && !error && (
              <FormMessage
                message="인증 코드가 발송되었습니다. 이메일을 확인해주세요."
                variant="info"
                className="mt-2"
              />
            )}
          </div>
        )}

        <FormMessage message={error ?? undefined} className="mt-2" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: page.tsx 구현**

`src/app/(main)/find-password/page.tsx`를 생성한다:

```typescript
import Image from "next/image";
import FindPasswordForm from "./_components/FindPasswordForm";

export default function FindPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="flex w-full max-w-[400px] flex-col items-center">
        <div className="flex flex-col items-center">
          <Image src="/whiskynavi-logo.png" alt="whiskynavi-logo" width={80} height={101} />
        </div>

        <div className="mt-6 w-full text-center text-white">
          <h1 className="typo-medium-20 font-semibold">비밀번호 초기화</h1>
          <p className="typo-medium-13 mt-2 text-gray-200">
            가입한 이메일로 인증코드를 발송한 뒤 임시 비밀번호를 보내드립니다.
          </p>
        </div>

        <FindPasswordForm />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: 폼 테스트 재실행**

Run:

```bash
pnpm test:run -- "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx"
```

Expected:

- `4 passed`
- `FAIL` 없음

- [ ] **Step 4: 전체 find-password 테스트 실행**

Run:

```bash
pnpm test:run -- "src/app/(main)/find-password/actions.test.ts" "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx"
```

Expected:

- 두 테스트 파일 모두 PASS

- [ ] **Step 5: 타입체크**

Run:

```bash
pnpm tsc --noEmit
```

Expected:

- TypeScript 에러 없음

- [ ] **Step 6: 린트**

Run:

```bash
pnpm lint
```

Expected:

- ESLint 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add \
  "src/app/(main)/find-password/page.tsx" \
  "src/app/(main)/find-password/_components/FindPasswordForm.tsx" \
  "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx" \
  "src/app/(main)/find-password/actions.ts" \
  "src/app/(main)/find-password/actions.test.ts"
git commit -m "feat: implement find-password reset flow"
```

---

## Task 5: 브랜치 최종 검증

이 단계는 기능 단위 검증과 회귀 방지를 위한 최소 확인이다.

**Files:**
- Modify: 없음

- [ ] **Step 1: 관련 테스트 재실행**

Run:

```bash
pnpm test:run -- "src/app/(main)/find-password/actions.test.ts" "src/app/(main)/find-password/_components/FindPasswordForm.test.tsx"
```

Expected:

- 관련 테스트 전부 PASS

- [ ] **Step 2: 전체 타입체크**

Run:

```bash
pnpm tsc --noEmit
```

Expected:

- TypeScript 에러 없음

- [ ] **Step 3: 전체 린트**

Run:

```bash
pnpm lint
```

Expected:

- ESLint 에러 없음

---

## 스펙 커버리지 점검

- `/find-password` route 추가: Task 4
- 단일 페이지 단계형 UX: Task 4
- reset code send API 호출: Task 2
- verify 후 자동 reset 호출: Task 2, Task 4
- `가입되지 않은 이메일입니다` 노출: Task 1, Task 2, Task 3
- 완료 상태와 `/sign-in` CTA: Task 3, Task 4
- focused test coverage: Task 1, Task 3, Task 5

## Placeholder 점검

- `TODO`, `TBD`, `implement later` 없음
- 각 코드 변경 step에 실제 코드 블록 포함
- 각 검증 step에 정확한 명령과 기대 결과 포함

## 타입 일관성 점검

- 서버 액션 이름은 전 구간에서 `sendResetCode`, `verifyAndResetPassword`로 통일
- 결과 타입은 `FindPasswordActionResult`로 통일
- UI 상태는 `idle | code-sent | resetting | completed`로 통일
