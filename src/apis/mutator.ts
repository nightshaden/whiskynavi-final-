import { ApiError, AuthError } from "./errors";
import { handleAuthError } from "./handle-auth-error";
import { refreshSessionToken } from "./refresh-token";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

function parseResponse(res: Response) {
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
      retryHeaders.set("Authorization", newToken);
      const retryRes = await fetch(fullUrl, {
        ...options,
        headers: retryHeaders,
        cache: "no-store",
      });

      if (retryRes.ok) {
        const data = await parseResponse(retryRes);
        return {
          data,
          status: retryRes.status,
          headers: retryRes.headers,
        } as T;
      }

      // 재시도도 401/403이면 리프레시 토큰도 만료된 것
      if (retryRes.status === 401 || retryRes.status === 403) {
        await handleAuthError();
        throw new AuthError();
      }

      // 다른 에러
      const detail = await extractErrorDetail(retryRes);
      throw new ApiError(retryRes.status, detail);
    }

    // 리프레시 실패 → 로그인 페이지로
    await handleAuthError();
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
