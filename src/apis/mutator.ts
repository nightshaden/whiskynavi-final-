import { AuthError } from "./errors";
import { handleAuthError } from "./handle-auth-error";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  console.log("???", fullUrl);
  const res = await fetch(fullUrl, {
    ...options,
    cache: "no-store",
  });

  if (res.status === 403) {
    await handleAuthError();
    throw new AuthError();
  }

  if (!res.ok) {
    let detail = "";
    try {
      const ctype = res.headers.get("content-type") ?? "";
      if (ctype.includes("application/json")) {
        const json = await res.json();
        detail = typeof json === "string" ? json : JSON.stringify(json);
      } else {
        detail = await res.text();
      }
    } catch {
      /* ignore */
    }
    const suffix = detail ? ` - ${detail}` : "";
    throw new Error(`[${res.status}] ${res.statusText}${suffix}`);
  }

  let data: unknown;

  if (res.status === 204 || res.status === 205) {
    data = undefined;
  } else {
    const ctype = res.headers.get("content-type") ?? "";
    data = ctype.includes("application/json")
      ? await res.json()
      : await res.text();
  }

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
