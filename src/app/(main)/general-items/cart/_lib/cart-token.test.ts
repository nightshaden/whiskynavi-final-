import { describe, expect, it } from "vitest";
import {
  CART_TOKEN_COOKIE,
  buildCartHeaders,
  getCartTokenCookieOptions,
  getResponseCartToken,
  normalizeCartToken,
} from "./cart-token";

describe("cart token utilities", () => {
  it("normalizes blank cart tokens to undefined", () => {
    expect(normalizeCartToken(" cart-1 ")).toBe("cart-1");
    expect(normalizeCartToken("   ")).toBeUndefined();
    expect(normalizeCartToken(undefined)).toBeUndefined();
  });

  it("builds cart, auth, and idempotency headers", () => {
    expect(
      buildCartHeaders({
        cartToken: "cart-1",
        authToken: "access-token",
        idempotencyKey: "idem-1",
      }),
    ).toEqual({
      Authorization: "Bearer access-token",
      "Idempotency-Key": "idem-1",
      "X-Cart-Token": "cart-1",
    });
  });

  it("does not double-prefix bearer tokens", () => {
    expect(buildCartHeaders({ authToken: "Bearer access-token" })).toEqual({
      Authorization: "Bearer access-token",
    });
  });

  it("extracts a cart token from cart-like responses", () => {
    expect(getResponseCartToken({ cartToken: "cart-2" })).toBe("cart-2");
    expect(getResponseCartToken({ data: { cartToken: "cart-3" } })).toBe("cart-3");
    expect(getResponseCartToken({})).toBeUndefined();
  });

  it("uses httpOnly lax cookie options", () => {
    expect(CART_TOKEN_COOKIE).toBe("wn_cart_token");
    expect(getCartTokenCookieOptions("production")).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    expect(getCartTokenCookieOptions("development")).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  });
});
