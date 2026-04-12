# Auth Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** API 서버 배포 시 프론트엔드 로그인이 풀리는 이슈 해결 — refresh 경로 일원화, 에러 종류 분류, 토큰 보존, 보안 개선

**Architecture:** NextAuth jwt callback을 토큰 리프레시의 단일 진실 공급원(Single Source of Truth)으로 만든다. customFetch에서는 401 시 직접 refresh하지 않고 세션 재조회를 통해 jwt callback의 refresh 결과를 받아오는 방식으로 변경한다. refresh 실패 시 에러 종류(네트워크/서버/인증)를 구분하여 일시적 장애에서는 토큰을 보존한다.

**Tech Stack:** Next.js 16, NextAuth v4, TypeScript strict

---

## File Structure

| Action  | File                                    | Responsibility                                             |
| ------- | --------------------------------------- | ---------------------------------------------------------- |
| Modify  | `src/apis/errors.ts`                    | NetworkError 클래스 추가                                   |
| Rewrite | `src/apis/refresh-token.ts`             | raw fetch refresh 함수 (에러 종류 구분)                    |
| Rewrite | `src/apis/mutator.ts`                   | customFetch에서 직접 refresh 제거, 401 시 세션 재조회 위임 |
| Rewrite | `src/apis/handle-auth-error.ts`         | 서버/클라이언트 분기 명확화                                |
| Rewrite | `src/lib/auth.ts`                       | jwt callback에서 raw fetch refresh 사용, 에러별 토큰 보존  |
| Modify  | `src/types/next-auth.d.ts`              | Session에서 refreshToken 제거, error 타입 세분화           |
| Modify  | `src/providers/AuthProvider.tsx`        | session.error 감지 → 자동 signOut                          |
| Modify  | `src/app/admin/layout.tsx`              | role 기반 접근 제어 추가                                   |
| Modify  | `src/app/admin/error.tsx`               | 문자열 매칭 → digest 기반 에러 분류                        |
| Delete  | `src/app/(main)/sign-in/actions.ts`     | dead code 제거                                             |
| Modify  | `src/app/(main)/sign-in/SignInForm.tsx` | dead JSX 제거, typo 수정                                   |

---

### Task 1: errors.ts에 NetworkError 추가

**Files:**

- Modify: `src/apis/errors.ts`

- [ ] **Step 1: NetworkError 클래스 추가**

```typescript
// src/apis/errors.ts — 기존 코드 끝(getUserErrorMessage 함수 아래)에 추가

export class NetworkError extends Error {
  constructor(
    message = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.",
  ) {
    super(message);
    this.name = "NetworkError";
  }
}
```

그리고 `getUserErrorMessage` 함수에 NetworkError 분기 추가:

```typescript
// 기존 getUserErrorMessage 수정
export function getUserErrorMessage(
  error: unknown,
  fallback = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
): string {
  if (error instanceof ApiError) return error.userMessage;
  if (error instanceof AuthError) return error.message;
  if (error instanceof NetworkError) return error.message;
  return fallback;
}
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공 (NetworkError는 아직 사용되지 않으므로 기존 동작에 영향 없음)

- [ ] **Step 3: Commit**

```bash
git add src/apis/errors.ts
git commit -m "feat: add NetworkError class for network failure distinction"
```

---

### Task 2: refresh-token.ts 리팩토링 — 에러 종류 구분

**Files:**

- Rewrite: `src/apis/refresh-token.ts`

- [ ] **Step 1: RefreshResult 타입 정의 및 callRefreshApi 리팩토링**

`src/apis/refresh-token.ts` 전체를 다음으로 교체:

```typescript
import { decode } from "next-auth/jwt";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

/**
 * refresh API 호출 결과.
 * - success: 새 accessToken + refreshToken
 * - auth_failed: refresh token이 만료/무효 (401/400) → 세션 파기 정당
 * - server_error: 서버 장애/네트워크 에러 (5xx, 연결 실패) → 세션 보존
 */
export type RefreshResult =
  | { status: "success"; accessToken: string; refreshToken: string }
  | { status: "auth_failed" }
  | { status: "server_error" };

/**
 * 백엔드 refresh API를 raw fetch로 호출한다.
 * customFetch를 사용하면 재귀가 발생하므로 반드시 raw fetch 사용.
 */
export async function callRefreshApi(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken ?? refreshToken;
      if (typeof newAccessToken === "string" && newAccessToken) {
        return {
          status: "success",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }
      // 응답은 200이지만 토큰이 없는 경우 → 서버 오류로 취급
      return { status: "server_error" };
    }

    // 401/400: refresh token 자체가 만료/무효
    if (res.status === 401 || res.status === 400 || res.status === 403) {
      return { status: "auth_failed" };
    }

    // 5xx, 429 등: 서버 일시 장애 → 세션 보존
    return { status: "server_error" };
  } catch {
    // 네트워크 연결 실패, DNS 에러, 타임아웃 등
    return { status: "server_error" };
  }
}

/**
 * 서버 환경: next-auth JWT 쿠키에서 refreshToken을 디코딩하여 리프레시.
 * Server Component / Route Handler에서 호출됨.
 */
export async function refreshOnServer(): Promise<RefreshResult> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return { status: "server_error" };

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // next-auth v4 쿠키명 — v5 마이그레이션 시 변경 필요
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ??
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) return { status: "auth_failed" };

    const decoded = await decode({ token: sessionToken, secret });
    if (!decoded?.refreshToken || typeof decoded.refreshToken !== "string") {
      return { status: "auth_failed" };
    }

    return callRefreshApi(decoded.refreshToken);
  } catch {
    return { status: "server_error" };
  }
}
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 에러 발생 — mutator.ts가 아직 구 `refreshSessionToken` 시그니처를 사용하므로 다음 Task에서 수정

- [ ] **Step 3: Commit (WIP)**

```bash
git add src/apis/refresh-token.ts
git commit -m "refactor: add RefreshResult type to distinguish error kinds in refresh-token"
```

---

### Task 3: auth.ts 리팩토링 — jwt callback에서 raw fetch refresh + 토큰 보존

**Files:**

- Rewrite: `src/lib/auth.ts`

- [ ] **Step 1: refreshAccessToken을 raw fetch 기반으로 교체하고, 에러별 토큰 보존**

`src/lib/auth.ts`를 다음으로 교체:

```typescript
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { postApiAuthLogin } from "@/apis/generated/api";
import { callRefreshApi } from "@/apis/refresh-token";

/**
 * access token 선제 리프레시 간격.
 * 백엔드 access token TTL(30분)보다 5분 앞서 갱신하여 만료 전에 교체.
 */
const TOKEN_REFRESH_INTERVAL = 25 * 60 * 1000;

/**
 * raw fetch 기반 토큰 리프레시.
 * - 성공: 새 accessToken + refreshToken 반환
 * - 인증 실패(401/400): 토큰 삭제 + error 설정 → 클라이언트에서 signOut 유도
 * - 서버 장애: 기존 토큰 보존 → 다음 요청에서 재시도
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, accessToken: undefined, error: "RefreshTokenError" };
  }

  const result = await callRefreshApi(token.refreshToken);

  switch (result.status) {
    case "success":
      return {
        ...token,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenIssuedAt: Date.now(),
        error: undefined,
      };
    case "auth_failed":
      // refresh token 자체가 무효 → 토큰 삭제, 클라이언트에서 signOut 유도
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        error: "RefreshTokenError",
      };
    case "server_error":
      // 서버 일시 장애 → 기존 토큰 보존, 다음 요청에서 재시도
      return {
        ...token,
        error: "RefreshTemporaryError",
      };
  }
}

// Naver 커스텀 Provider
const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { scope: "" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  profile(profile: {
    response: {
      id: string;
      name?: string;
      email?: string;
      profile_image?: string;
    };
  }) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image,
    };
  },
  clientId: process.env.NAVER_CLIENT_ID ?? "",
  clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        try {
          const res = await postApiAuthLogin({
            email: credentials.email,
            password: credentials.password,
          });

          if (
            !res.data.accessToken ||
            !res.data.refreshToken ||
            !res.data.userId
          ) {
            throw new Error("서버 응답에 필수 인증 정보가 누락되었습니다.");
          }

          return {
            id: String(res.data.userId),
            name: res.data.username ?? "",
            email: res.data.email ?? "",
            roles: res.data.userInfo?.roles,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "로그인에 실패했습니다.";
          throw new Error(message);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
    NaverProvider,
  ],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // 최초 로그인 시 user 정보를 token에 저장
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.tokenIssuedAt = Date.now();

        if (account) {
          token.provider = account.provider;
          token.providerAccountId = account.providerAccountId;
        }
        return token;
      }

      // 이후 호출: 토큰 리프레시 필요 여부 확인
      const elapsed = Date.now() - (token.tokenIssuedAt ?? 0);
      if (token.refreshToken && elapsed > TOKEN_REFRESH_INTERVAL) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.roles = token.roles;
      }
      session.accessToken = token.accessToken;
      // refreshToken은 서버에서만 사용 — 클라이언트에 노출하지 않음
      session.error = token.error;
      return session;
    },

    async signIn({ account }) {
      if (account?.provider !== "credentials") {
        // TODO: 백엔드 소셜 로그인 API 호출
        // 구현 전까지 소셜 로그인은 허용하되, 토큰이 없는 상태임에 유의
      }
      return true;
    },
  },

  debug: process.env.NODE_ENV === "development",
};

/**
 * 서버 컴포넌트에서 인증 토큰을 가져오는 헬퍼 함수.
 * getServerSession 호출 시 jwt callback이 트리거되어 만료된 토큰은 자동 갱신됨.
 * @returns accessToken 또는 undefined
 */
export async function getAuthToken(): Promise<string | undefined> {
  const session = await getServerSession(authOptions);
  return session?.accessToken;
}
```

**핵심 변경점:**

- `postApiAuthRefresh`(customFetch 경유) → `callRefreshApi`(raw fetch) 사용으로 재귀 제거
- `server_error` 시 기존 토큰 보존 (accessToken/refreshToken 삭제 안함)
- `session.refreshToken`을 클라이언트에 노출하지 않음
- `console.log` 제거
- `token.refreshToken!` → early return guard
- `token.id as string` → `token.id ?? ""`
- authorize에서 필수 필드 runtime 검증

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 에러 — mutator.ts가 아직 구 시그니처 사용 중

- [ ] **Step 3: Commit (WIP)**

```bash
git add src/lib/auth.ts
git commit -m "refactor: unify token refresh in jwt callback with error classification"
```

---

### Task 4: next-auth.d.ts 수정 — Session에서 refreshToken 제거

**Files:**

- Modify: `src/types/next-auth.d.ts`

- [ ] **Step 1: Session에서 refreshToken 제거, error 타입 세분화**

`src/types/next-auth.d.ts` 전체를 다음으로 교체:

```typescript
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles?: string[];
    } & DefaultSession["user"];
    accessToken?: string;
    // refreshToken은 서버(JWT) 내부에서만 사용 — 클라이언트에 노출하지 않음
    error?: "RefreshTokenError" | "RefreshTemporaryError";
  }

  interface User extends DefaultUser {
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    roles?: string[];
    provider?: string;
    providerAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenIssuedAt?: number;
    error?: "RefreshTokenError" | "RefreshTemporaryError";
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/next-auth.d.ts
git commit -m "refactor: remove refreshToken from Session, narrow error type"
```

---

### Task 5: mutator.ts 리팩토링 — 직접 refresh 제거, 401 시 에러 분류

**Files:**

- Rewrite: `src/apis/mutator.ts`

- [ ] **Step 1: customFetch에서 refresh 로직 제거, 네트워크 에러 처리 추가**

`src/apis/mutator.ts` 전체를 다음으로 교체:

```typescript
import { AuthError, ApiError, NetworkError } from "./errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

function parseResponse(res: Response): Promise<unknown> | undefined {
  if (res.status === 204 || res.status === 205) {
    return undefined;
  }
  const ctype = res.headers.get("content-type") ?? "";
  return ctype.includes("application/json") ? res.json() : res.text();
}

async function extractErrorDetail(res: Response): Promise<string> {
  try {
    const ctype = res.headers.get("content-type") ?? "";
    if (ctype.includes("application/json")) {
      const json = await res.json();
      return typeof json === "string" ? json : JSON.stringify(json);
    }
    return await res.text();
  } catch {
    return "";
  }
}

/**
 * Orval custom mutator.
 * - 401: AuthError throw → 호출자(Server Action / error boundary)에서 처리
 * - 403: ApiError throw → 권한 부족으로 처리 (로그아웃하지 않음)
 * - 5xx: ApiError throw
 * - 네트워크 에러: NetworkError throw
 *
 * 토큰 리프레시는 이 함수에서 하지 않음.
 * NextAuth jwt callback이 getServerSession/getSession 호출 시 자동으로 처리.
 */
export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

  let res: Response;
  try {
    res = await fetch(fullUrl, {
      ...options,
      cache: "no-store",
    });
  } catch {
    throw new NetworkError();
  }

  // 401: 인증 만료 — AuthError throw (호출자에서 로그인 페이지 이동 결정)
  if (res.status === 401) {
    throw new AuthError();
  }

  if (!res.ok) {
    const detail = await extractErrorDetail(res);
    throw new ApiError(res.status, detail);
  }

  const data = await parseResponse(res);
  return { data, status: res.status, headers: res.headers } as T;
};

export default customFetch;

/**
 * 서버 컴포넌트에서 인증 토큰을 RequestInit headers로 변환하는 헬퍼.
 * @param token - Bearer access token. undefined이면 인증 헤더 없이 요청.
 * @returns RequestInit with Authorization header, or undefined if no token
 *
 * @example
 * const token = await getAuthToken();
 * const res = await listUsers(params, withToken(token));
 */
export const withToken = (token?: string): RequestInit | undefined => {
  if (!token) return undefined;
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { headers: { Authorization: value } };
};
```

**핵심 변경점:**

- `refreshSessionToken()` 호출 제거 — jwt callback에 위임
- `handleAuthError()` 호출 제거 — AuthError throw로 호출자에서 처리
- 401만 AuthError, 403은 일반 ApiError (권한 부족)
- fetch 네트워크 에러를 NetworkError로 래핑
- import 정리 (`{ AuthError, ApiError, NetworkError }` 단일 import)

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공 (handle-auth-error.ts와 refresh-token.ts의 refreshSessionToken은 이제 auth.ts에서만 사용)

- [ ] **Step 3: Commit**

```bash
git add src/apis/mutator.ts
git commit -m "refactor: remove direct refresh from customFetch, add NetworkError handling"
```

---

### Task 6: handle-auth-error.ts 삭제 (더 이상 사용되지 않음)

**Files:**

- Delete: `src/apis/handle-auth-error.ts`

- [ ] **Step 1: 사용처 확인 후 삭제**

mutator.ts에서 더 이상 import하지 않으므로 안전하게 삭제 가능.

```bash
rm src/apis/handle-auth-error.ts
```

- [ ] **Step 2: 다른 파일에서 import가 없는지 확인**

Run: `grep -r "handle-auth-error" src/`
Expected: 결과 없음

- [ ] **Step 3: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove unused handle-auth-error module"
```

---

### Task 7: AuthProvider에 session.error 감지 로직 추가

**Files:**

- Modify: `src/providers/AuthProvider.tsx`

- [ ] **Step 1: session.error 감지 컴포넌트 추가**

`src/providers/AuthProvider.tsx`를 다음으로 교체:

```typescript
"use client";

import { signOut, useSession, SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * session.error가 "RefreshTokenError"이면 자동 signOut.
 * "RefreshTemporaryError"는 일시적 장애이므로 무시 — 다음 요청에서 재시도됨.
 */
function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signOut({ callbackUrl: "/sign-in" });
    }
  }, [session?.error]);

  return null;
}

export function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <SessionErrorHandler />
      {children}
    </SessionProvider>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add src/providers/AuthProvider.tsx
git commit -m "feat: add session error handler to auto-signout on token expiry"
```

---

### Task 8: admin/layout.tsx에 role 기반 접근 제어 추가

**Files:**

- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: getServerSession으로 role 검사**

`src/app/admin/layout.tsx`를 다음으로 교체:

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { authOptions } from "@/lib/auth";

import AdminLayoutClient from "./_components/AdminLayoutClient";
import SidebarStatsSection from "./_components/SidebarStatsSection";
import SidebarStatsSkeleton from "./_components/SidebarStatsSkeleton";

export const metadata = {
  title: "관리자",
  description: "위스키내비 관리자 페이지",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/sign-in");
  }

  if (!session.user.roles?.includes("ADMIN")) {
    redirect("/");
  }

  return (
    <main>
      <AdminLayoutClient
        statsSlot={
          <Suspense fallback={<SidebarStatsSkeleton />}>
            <SidebarStatsSection />
          </Suspense>
        }
      >
        {children}
      </AdminLayoutClient>
    </main>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat: add role-based access control to admin layout"
```

---

### Task 9: admin/error.tsx — 에러 분류 수정

**Files:**

- Modify: `src/app/admin/error.tsx`

- [ ] **Step 1: 문자열 매칭을 digest 기반으로 변경**

`src/app/admin/error.tsx`의 에러 판별 부분을 수정:

```typescript
// 기존 (line 17-19):
// const is403 = error.message.includes("[403]");
// const is401 = error.message.includes("[401]");
// const isAuthError = is403 || is401;

// 변경:
const isAuthError =
  error.message === "인증이 만료되었습니다. 다시 로그인해주세요." ||
  error.digest?.includes("AUTH_ERROR") === true;
```

또한 `console.error` 줄은 development에서만 유용하므로 조건부로 변경:

```typescript
useEffect(() => {
  if (process.env.NODE_ENV === "development") {
    console.error("Admin Error:", error);
  }
}, [error]);
```

- [ ] **Step 2: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/error.tsx
git commit -m "fix: replace string matching with message-based auth error detection"
```

---

### Task 10: Dead code 정리

**Files:**

- Delete: `src/app/(main)/sign-in/actions.ts`
- Modify: `src/app/(main)/sign-in/SignInForm.tsx`

- [ ] **Step 1: 미사용 actions.ts 삭제**

```bash
rm src/app/\(main\)/sign-in/actions.ts
```

- [ ] **Step 2: SignInForm.tsx에서 dead JSX 블록 제거 및 typo 수정**

SignInForm.tsx line 134-171의 dead JSX 블록을 삭제한다.

또한 line 78과 95의 `typo-medium-13 typo-medium-13` 중복을 `typo-medium-13`으로 수정한다.

- [ ] **Step 3: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove dead code (sign-in actions, commented JSX, duplicate CSS classes)"
```

---

### Task 11: refresh-token.ts에서 refreshOnClient/refreshSessionToken 제거

**Files:**

- Modify: `src/apis/refresh-token.ts`

- [ ] **Step 1: 더 이상 사용되지 않는 함수 제거**

mutator.ts에서 더 이상 `refreshSessionToken`을 호출하지 않으므로, `refreshOnClient`와 `refreshSessionToken`을 제거한다.

`refreshOnServer`도 mutator.ts에서 사용하지 않지만, 향후 필요할 수 있으므로 exported로 유지.

최종 `src/apis/refresh-token.ts`:

```typescript
import { decode } from "next-auth/jwt";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

/**
 * refresh API 호출 결과.
 * - success: 새 accessToken + refreshToken
 * - auth_failed: refresh token이 만료/무효 (401/400) → 세션 파기 정당
 * - server_error: 서버 장애/네트워크 에러 (5xx, 연결 실패) → 세션 보존
 */
export type RefreshResult =
  | { status: "success"; accessToken: string; refreshToken: string }
  | { status: "auth_failed" }
  | { status: "server_error" };

/**
 * 백엔드 refresh API를 raw fetch로 호출한다.
 * customFetch를 사용하면 재귀가 발생하므로 반드시 raw fetch 사용.
 */
export async function callRefreshApi(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken ?? refreshToken;
      if (typeof newAccessToken === "string" && newAccessToken) {
        return {
          status: "success",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }
      return { status: "server_error" };
    }

    if (res.status === 401 || res.status === 400 || res.status === 403) {
      return { status: "auth_failed" };
    }

    return { status: "server_error" };
  } catch {
    return { status: "server_error" };
  }
}
```

- [ ] **Step 2: 다른 파일에서 제거된 함수를 import하는 곳이 없는지 확인**

Run: `grep -r "refreshSessionToken\|refreshOnServer\|refreshOnClient" src/ --include="*.ts" --include="*.tsx"`
Expected: `refresh-token.ts` 이외에는 결과 없음

- [ ] **Step 3: 빌드 확인**

Run: `pnpm build`
Expected: 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add src/apis/refresh-token.ts
git commit -m "refactor: remove unused client refresh functions from refresh-token"
```

---

### Task 12: 최종 검증

**Files:** (수정 없음)

- [ ] **Step 1: 린트 확인**

Run: `pnpm lint`
Expected: 에러 없음

- [ ] **Step 2: 포맷팅**

Run: `pnpm format`

- [ ] **Step 3: 프로덕션 빌드**

Run: `pnpm build`
Expected: 빌드 성공, 경고 없음

- [ ] **Step 4: 삭제된 파일 확인**

Run: `ls src/apis/handle-auth-error.ts 2>/dev/null || echo "deleted"` → "deleted"
Run: `ls src/app/\(main\)/sign-in/actions.ts 2>/dev/null || echo "deleted"` → "deleted"

- [ ] **Step 5: 변경 요약 확인**

Run: `git diff --stat main`

변경 파일 목록이 File Structure 테이블과 일치하는지 확인:

- `src/apis/errors.ts` — modified
- `src/apis/refresh-token.ts` — modified
- `src/apis/mutator.ts` — modified
- `src/apis/handle-auth-error.ts` — deleted
- `src/lib/auth.ts` — modified
- `src/types/next-auth.d.ts` — modified
- `src/providers/AuthProvider.tsx` — modified
- `src/app/admin/layout.tsx` — modified
- `src/app/admin/error.tsx` — modified
- `src/app/(main)/sign-in/actions.ts` — deleted
- `src/app/(main)/sign-in/SignInForm.tsx` — modified

- [ ] **Step 6: 최종 Commit (포맷팅)**

```bash
git add -A
git commit -m "chore: format after auth refactor"
```
