import qs from "qs";
import { AuthError } from "./errors";
import { handleAuthError } from "./handle-auth-error";

/** 직렬화 가능한 JSON 값 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
type MethodWithBody = Exclude<HttpMethod, "GET" | "HEAD">;

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

/** 내부적으로 사용: 공통 옵션 (body/method는 여기서 제외) */
type BaseOptions = Omit<RequestInit, "body" | "method"> & {
  params?: Record<string, any>;
  /** Authorization Bearer 토큰 (서버 컴포넌트에서 사용) */
  token?: string;
  headers?: HeadersInit;
  cache?: RequestCache;
};

/** GET/ 전용: 본문 금지 */
export type GetHeadOptions = BaseOptions & {
  method?: "GET";
  json?: never;
  body?: never;
};

/** 본문이 JSON일 때 (Content-Type 자동 설정) */
export type MethodOptionsJson<TJson extends JsonValue> = BaseOptions & {
  method: MethodWithBody;
  json: TJson;
  body?: never;
};

/** 본문이 원시 BodyInit일 때 (FormData/Blob/ArrayBuffer 등) */
export type MethodOptionsBody = BaseOptions & {
  method: MethodWithBody;
  body: BodyInit | null;
  json?: never;
};

/** 본문 없이 메서드만 지정할 때 (DELETE, POST 등) */
export type MethodOptionsNoBody = BaseOptions & {
  method: MethodWithBody;
  json?: never;
  body?: never;
};

/** 최종 옵션 oneOf */
export type FetchOptions<TJson extends JsonValue = JsonValue> =
  | GetHeadOptions
  | MethodOptionsJson<TJson>
  | MethodOptionsBody
  | MethodOptionsNoBody;

/**
 * 클라이언트에서 리프레시 토큰으로 새 access token을 발급받는다.
 */
async function refreshSessionToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const { getSession } = await import("next-auth/react");
    const session = await getSession();
    if (!session?.refreshToken) return null;

    const refreshRes = await fetch(
      `${DEFAULT_BASE_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      },
    );
    if (!refreshRes.ok) return null;

    const data = await refreshRes.json();
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

/** 응답 본문 파싱 */
async function parseHttpResponse<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.status === 205) {
    return undefined as unknown as T;
  }
  const ctype = res.headers.get("content-type") ?? "";
  if (ctype.includes("application/json")) {
    return (await res.json()) as T;
  }
  const text = await res.text();
  return text as unknown as T;
}

/** 에러 응답에서 상세 메시지 추출 */
async function extractHttpErrorDetail(res: Response): Promise<string> {
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

/** 절대 URL 여부 */
function isAbsoluteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

/** URL 구성 + qs 직렬화 */
function buildUrl(baseURL: string, path: string, params?: Record<string, any>) {
  const query = params
    ? `?${qs.stringify(params, { arrayFormat: "brackets", skipNulls: true })}`
    : "";
  return `${isAbsoluteUrl(path) ? "" : baseURL}${path}${query}`;
}

export async function http<TResponse = unknown>(
  path: string,
  options?: GetHeadOptions,
): Promise<TResponse>;

export async function http<
  TResponse = unknown,
  TJson extends JsonValue = JsonValue,
>(path: string, options: MethodOptionsJson<TJson>): Promise<TResponse>;

export async function http<TResponse = unknown>(
  path: string,
  options: MethodOptionsBody,
): Promise<TResponse>;

export async function http<TResponse = unknown>(
  path: string,
  options: MethodOptionsNoBody,
): Promise<TResponse>;

export async function http<
  TResponse = unknown,
  TJson extends JsonValue = JsonValue,
>(path: string, options: FetchOptions<TJson> = {}): Promise<TResponse> {
  const {
    method = "GET",
    params,
    token,
    headers,
    cache = "no-store",
    ...rest
  } = options as FetchOptions<TJson> & { token?: string }; // 좁히기 전에 공통만 분리

  // GET/HEAD이면 json/body가 없어야 함 (런타임 보호 – TS에서 이미 금지지만 안전망)
  if (
    method === "GET" &&
    ("json" in (options as any) || "body" in (options as any))
  ) {
    throw new Error(`GET/HEAD 요청에는 body/json을 보낼 수 없습니다.`);
  }

  const baseURL = DEFAULT_BASE_URL;
  const url = buildUrl(baseURL, path, options.params);

  const h = new Headers(headers);

  // Bearer 토큰이 있으면 Authorization 헤더 추가
  if (token && !h.has("Authorization")) {
    // 토큰이 이미 "Bearer "로 시작하면 그대로 사용
    const authValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    h.set("Authorization", authValue);
  }

  let finalBody: BodyInit | null | undefined;

  if (method !== "GET") {
    if (
      "json" in (options as MethodOptionsJson<TJson>) &&
      (options as any).json !== undefined
    ) {
      if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
      finalBody = JSON.stringify((options as MethodOptionsJson<TJson>).json);
    } else if ("body" in (options as MethodOptionsBody)) {
      // FormData/Blob/ArrayBuffer 등은 Content-Type 자동/직접 결정
      finalBody = (options as MethodOptionsBody).body ?? undefined;
    }
  }

  const res = await fetch(url, {
    method,
    headers: h,
    body: finalBody,
    cache,
    ...rest,
  });

  // 401/403: 토큰 만료 → 리프레시 시도 후 재요청
  if (res.status === 401 || res.status === 403) {
    const newToken = await refreshSessionToken();

    if (newToken) {
      // 새 토큰으로 재요청
      h.set("Authorization", `Bearer ${newToken}`);
      const retryRes = await fetch(url, {
        method,
        headers: h,
        body: finalBody,
        cache,
        ...rest,
      });

      if (retryRes.ok) {
        return parseHttpResponse<TResponse>(retryRes);
      }

      if (retryRes.status === 401 || retryRes.status === 403) {
        await handleAuthError();
        throw new AuthError();
      }

      const detail = await extractHttpErrorDetail(retryRes);
      const suffix = detail ? ` - ${detail}` : "";
      throw new Error(`[${retryRes.status}] ${retryRes.statusText}${suffix}`);
    }

    // 리프레시 실패 → 로그인 페이지로
    await handleAuthError();
    throw new AuthError();
  }

  if (!res.ok) {
    const detail = await extractHttpErrorDetail(res);
    const suffix = detail ? ` - ${detail}` : "";
    throw new Error(`[${res.status}] ${res.statusText}${suffix}`);
  }

  return parseHttpResponse<TResponse>(res);
}
