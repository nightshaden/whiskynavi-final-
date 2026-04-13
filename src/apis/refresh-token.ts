import { decode } from "next-auth/jwt";
import { authLogger } from "./auth-logger";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

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
export async function callRefreshApi(refreshToken: string): Promise<RefreshResult> {
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
      authLogger.error("callRefreshApi: 200 OK but no accessToken");
      return { status: "server_error" };
    }

    authLogger.error(`callRefreshApi: backend responded ${res.status}`);
    if (res.status === 401 || res.status === 400 || res.status === 403) {
      return { status: "auth_failed" };
    }

    return { status: "server_error" };
  } catch (e) {
    authLogger.error("callRefreshApi: unexpected error", e);
    return { status: "server_error" };
  }
}

/**
 * 401 발생 시 세션에서 refreshToken을 꺼내 refresh API 호출.
 * 성공하면 새 accessToken 반환, 실패하면 null.
 *
 * 동시 요청의 중복 refresh를 방지하기 위해 singleton promise 패턴 사용.
 */
let refreshPromise: Promise<string | null> | null = null;

export async function refreshSessionToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function doRefresh(): Promise<string | null> {
  if (typeof window === "undefined") {
    return refreshOnServer();
  }
  return refreshOnClient();
}

async function refreshOnServer(): Promise<string | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    authLogger.error("refreshOnServer: NEXTAUTH_SECRET missing");
    return null;
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    // next-auth v4 쿠키명 — v5 마이그레이션 시 변경 필요
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ?? cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      authLogger.error("refreshOnServer: no session cookie found");
      return null;
    }

    const decoded = await decode({ token: sessionToken, secret });
    if (!decoded?.refreshToken || typeof decoded.refreshToken !== "string") {
      authLogger.error("refreshOnServer: no refreshToken in JWT");
      return null;
    }

    const result = await callRefreshApi(decoded.refreshToken);
    if (result.status === "success") {
      authLogger.warn("refreshOnServer: refresh succeeded");
      return result.accessToken;
    }
    authLogger.error(`refreshOnServer: callRefreshApi → ${result.status}`);
    return null;
  } catch (e) {
    authLogger.error("refreshOnServer: unexpected error", e);
    return null;
  }
}

async function refreshOnClient(): Promise<string | null> {
  try {
    const { getSession } = await import("next-auth/react");
    // getSession은 NextAuth /api/auth/session을 호출하여
    // jwt callback을 트리거 → 만료된 토큰은 자동 갱신됨
    const session = await getSession();
    // jwt callback이 갱신한 최신 accessToken을 반환
    return session?.accessToken ?? null;
  } catch {
    return null;
  }
}
