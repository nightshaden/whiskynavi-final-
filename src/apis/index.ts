import qs from "qs";

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

/** 최종 옵션 oneOf */
export type FetchOptions<TJson extends JsonValue = JsonValue> =
  | GetHeadOptions
  | MethodOptionsJson<TJson>
  | MethodOptionsBody;

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

export async function http<
  TResponse = unknown,
  TJson extends JsonValue = JsonValue,
>(path: string, options: FetchOptions<TJson> = {}): Promise<TResponse> {
  const {
    method = "GET",
    params,
    headers,
    cache = "no-store",
    ...rest
  } = options as FetchOptions<TJson>; // 좁히기 전에 공통만 분리

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

  if (!res.ok) {
    // 에러 본문을 최대한 읽어서 메시지에 담아주기
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

  if (res.status === 204 || res.status === 205) {
    return undefined as unknown as TResponse;
  }

  const ctype = res.headers.get("content-type") ?? "";
  if (ctype.includes("application/json")) {
    return (await res.json()) as TResponse;
  }
  // JSON 외 응답 fallback
  const text = await res.text();
  return text as unknown as TResponse;
}
