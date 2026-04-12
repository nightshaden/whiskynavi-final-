import { ApiError, AuthError, NetworkError } from "./errors";

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
