import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const CART_TOKEN_COOKIE = "wn_cart_token";

export type CartHeaderInput = {
  cartToken?: string;
  authToken?: string;
  idempotencyKey?: string;
};

export function normalizeCartToken(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildCartHeaders(input: CartHeaderInput): Record<string, string> {
  const headers: Record<string, string> = {};
  const cartToken = normalizeCartToken(input.cartToken);
  const authToken = normalizeCartToken(input.authToken);
  const idempotencyKey = normalizeCartToken(input.idempotencyKey);

  if (authToken) {
    headers.Authorization = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  if (cartToken) {
    headers["X-Cart-Token"] = cartToken;
  }

  return headers;
}

export function getResponseCartToken(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;
  const directToken = normalizeCartToken(typeof record.cartToken === "string" ? record.cartToken : undefined);
  if (directToken) return directToken;

  const data = record.data;
  if (!data || typeof data !== "object") return undefined;
  const dataRecord = data as Record<string, unknown>;
  return normalizeCartToken(typeof dataRecord.cartToken === "string" ? dataRecord.cartToken : undefined);
}

export function getCartTokenCookieOptions(nodeEnv = process.env.NODE_ENV): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
