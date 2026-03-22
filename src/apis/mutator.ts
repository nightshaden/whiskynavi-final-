import { AuthError } from "./errors";
import { handleAuthError } from "./handle-auth-error";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

/**
 * 응답 본문을 파싱하여 반환
 */
function parseResponse(res: Response) {
  if (res.status === 204 || res.status === 205) {
    return undefined;
  }
  const ctype = res.headers.get("content-type") ?? "";
  return ctype.includes("application/json") ? res.json() : res.text();
}

/**
 * 에러 응답에서 상세 메시지 추출
 */
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
 * 클라이언트에서 리프레시 토큰으로 새 access token을 발급받는다.
 * next-auth의 시간 기반 리프레시를 우회하기 위해,
 * 현재 세션의 refreshToken으로 직접 백엔드 refresh API를 호출하고
 * next-auth 세션을 업데이트한다.
 */
async function refreshSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (!session?.refreshToken) return null;

    // 백엔드 refresh API 직접 호출
    const refreshRes = await fetch(
      `${BASE_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      },
    );

    if (!refreshRes.ok) return null;

    const data = await refreshRes.json();
    if (!data.accessToken) return null;

    // next-auth JWT 세션 업데이트를 위해 세션 endpoint를 트리거
    // (JWT callback에서 다음번에 새 토큰을 사용하도록)
    // 현재 next-auth v4에서는 session update가 제한적이므로
    // 반환된 새 토큰을 직접 사용하고, 페이지 전환 시 세션이 갱신됨
    return data.accessToken;
  } catch {
    return null;
  }
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    cache: "no-store",
  });

  // 401/403: 토큰 만료 → 리프레시 시도 후 재요청
  if (res.status === 401 || res.status === 403) {
    const newToken = await refreshSessionToken();

    if (newToken) {
      // 새 토큰으로 재요청
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      const retryRes = await fetch(fullUrl, {
        ...options,
        headers: retryHeaders,
        cache: "no-store",
      });

      if (retryRes.ok) {
        const data = await parseResponse(retryRes);
        return { data, status: retryRes.status, headers: retryRes.headers } as T;
      }

      // 재시도도 401/403이면 리프레시 토큰도 만료된 것
      if (retryRes.status === 401 || retryRes.status === 403) {
        await handleAuthError();
        throw new AuthError();
      }

      // 다른 에러
      const detail = await extractErrorDetail(retryRes);
      const suffix = detail ? ` - ${detail}` : "";
      throw new Error(`[${retryRes.status}] ${retryRes.statusText}${suffix}`);
    }

    // 리프레시 실패 → 로그인 페이지로
    await handleAuthError();
    throw new AuthError();
  }

  if (!res.ok) {
    const detail = await extractErrorDetail(res);
    const suffix = detail ? ` - ${detail}` : "";
    throw new Error(`[${res.status}] ${res.statusText}${suffix}`);
  }

  const data = await parseResponse(res);
  return { data, status: res.status, headers: res.headers } as T;
};

export default customFetch;

/**
 * 서버 컴포넌트에서 인증 토큰을 RequestInit headers로 변환하는 헬퍼.
 *
 * @example
 * // 서버 컴포넌트에서:
 * const token = await getAuthToken();
 * const res = await listUsers(params, withToken(token));
 */
export const withToken = (token?: string): RequestInit | undefined => {
  if (!token) return undefined;
  const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  return { headers: { Authorization: value } };
};
