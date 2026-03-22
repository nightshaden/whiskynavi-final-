import { decode } from "next-auth/jwt";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

// 백엔드 refresh API를 raw fetch로 호출 (customFetch 사용 시 재귀 발생)
async function callRefreshApi(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

// 서버: next-auth JWT 쿠키에서 refreshToken을 디코딩하여 리프레시
async function refreshOnServer(): Promise<string | null> {
  try {
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();

    // next-auth v4 쿠키명 (dev: next-auth.session-token, prod: __Secure-next-auth.session-token)
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value ??
      cookieStore.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) return null;

    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    if (!decoded?.refreshToken) return null;
    return callRefreshApi(decoded.refreshToken as string);
  } catch {
    return null;
  }
}

// 클라이언트: next-auth/react getSession으로 refreshToken을 가져와 리프레시
async function refreshOnClient(): Promise<string | null> {
  try {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (!session?.refreshToken) return null;

    return callRefreshApi(session.refreshToken);
  } catch {
    return null;
  }
}

// 서버/클라이언트 환경에 따라 적절한 리프레시 로직 실행
export async function refreshSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return refreshOnServer();
  }
  return refreshOnClient();
}
