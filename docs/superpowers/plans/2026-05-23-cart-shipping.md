# Cart and Shipping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 일반상품 장바구니, 배송비 견적, 장바구니 기반 주문, 관리자 배송비 정책 화면을 추가한다.

**Architecture:** OpenAPI 클라이언트는 `pnpm gen:api`로 재생성하고 직접 수정하지 않는다. 장바구니 토큰, 입력 검증, 인증 헤더, 경로 재검증은 화면별 server action과 작은 유틸에 둔다. 기존 단건 배송 주문은 유지하고, 장바구니 화면과 장바구니 주문서를 별도 라우트로 추가한다.

**Tech Stack:** Next.js 16 App Router, React 19, Server Components, Server Actions, Vitest, Testing Library, Orval fetch client, Tailwind CSS, shadcn/ui, Toss Payments SDK.

---

## File Structure

- Modify: `package-lock.json`, `pnpm-lock.yaml`은 설치 명령이 변경하지 않는 한 건드리지 않는다.
- Modify: `src/apis/generated/api.ts` - `corepack pnpm gen:api`가 갱신한다.
- Create: `src/app/(main)/general-items/cart/_lib/cart-token.ts` - `wn_cart_token` 쿠키명, cart/auth/idempotency 헤더 구성, 쿠키 옵션 순수 유틸.
- Create: `src/app/(main)/general-items/cart/_lib/cart-token.test.ts` - cart token 순수 유틸 테스트.
- Create: `src/app/(main)/general-items/cart/_lib/cart-utils.ts` - 장바구니 수량 정규화, 주문 가능 여부, 표시 금액 유틸.
- Create: `src/app/(main)/general-items/cart/_lib/cart-utils.test.ts` - 장바구니 표시/주문 가능 여부 테스트.
- Create: `src/app/(main)/general-items/cart/actions.ts` - 장바구니 조회, 견적 조회, 항목 추가, 수량 변경, 삭제 server action.
- Create: `src/app/(main)/general-items/cart/actions.test.ts` - 장바구니 action 입력 검증과 헤더 구성 테스트.
- Modify: `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.tsx` - 기존 바로 주문 form에 장바구니 담기 액션을 추가한다.
- Create: `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx` - 장바구니 담기 버튼과 성공 안내 테스트.
- Create: `src/app/(main)/general-items/cart/_components/CartContent.tsx` - 장바구니 목록, 수량 변경, 삭제, 견적 요약 UI.
- Create: `src/app/(main)/general-items/cart/_components/CartContent.test.tsx` - invalid 항목과 주문서 이동 차단 UI 테스트.
- Create: `src/app/(main)/general-items/cart/page.tsx` - 장바구니 Server Component page.
- Create: `src/app/(main)/general-items/cart/order/actions.ts` - 장바구니 기반 계좌이체/토스 주문 action.
- Create: `src/app/(main)/general-items/cart/order/actions.test.ts` - 장바구니 주문 action 검증 테스트.
- Create: `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.tsx` - 장바구니 배송 주문서 Client Component.
- Create: `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.test.tsx` - 장바구니 주문서 요약과 결제 버튼 테스트.
- Create: `src/app/(main)/general-items/cart/order/page.tsx` - 장바구니 주문서 Server Component page.
- Create: `src/app/(main)/general-items/cart/order/toss/success/page.tsx` - 장바구니 토스 성공 page.
- Create: `src/app/(main)/general-items/cart/order/toss/success/TossSuccessClient.tsx` - 장바구니 토스 확정 Client Component.
- Create: `src/app/(main)/general-items/cart/order/toss/fail/page.tsx` - 장바구니 토스 실패 page.
- Create: `src/app/admin/shipping-policy/actions.ts` - 관리자 배송비 정책 저장 action.
- Create: `src/app/admin/shipping-policy/actions.test.ts` - 관리자 배송비 정책 action 테스트.
- Create: `src/app/admin/shipping-policy/_components/ShippingPolicyContent.tsx` - 관리자 정책 폼 UI.
- Create: `src/app/admin/shipping-policy/_components/ShippingPolicyContent.test.tsx` - 관리자 정책 폼 렌더링과 제출 테스트.
- Create: `src/app/admin/shipping-policy/page.tsx` - 관리자 정책 Server Component page.
- Modify: `src/app/admin/_components/AdminSidebar.tsx` - 일반상품 메뉴에 배송비 정책 링크 추가.

---

### Task 1: Regenerate OpenAPI Client

**Files:**
- Modify: `src/apis/generated/api.ts`
- Read: `package.json`

- [ ] **Step 1: Ensure package manager is available**

Run:

```powershell
corepack pnpm --version
```

Expected: prints a pnpm version. In this workspace, `pnpm` may not be on PATH, so use `corepack pnpm` for all commands.

- [ ] **Step 2: Install dependencies if `node_modules` is absent**

Run:

```powershell
if (-not (Test-Path node_modules)) { corepack pnpm install --frozen-lockfile }
```

Expected: dependencies are installed without lockfile changes.

- [ ] **Step 3: Regenerate API client**

Run:

```powershell
corepack pnpm gen:api
```

Expected: `src/apis/generated/api.ts` contains cart, cart order, and shipping-policy exports.

- [ ] **Step 4: Verify generated exports**

Run:

```powershell
rg -n "export const (getOrCreate|getCurrent|addItem|quote|updateQuantity|deleteItem|postApiOrdersGeneralItemsDeliveryCart|export const get =|export const update =)" src/apis/generated/api.ts
rg -n "CartResponse|CartItemResponse|CartQuoteResponse|ShippingPolicyResponse" src/apis/generated/api.ts
```

Expected: cart response types exist. The action tasks below use these generated exports:

```ts
import {
  addItem,
  deleteItem,
  getCurrent,
  getOrCreate,
  quote,
  updateQuantity,
  postApiOrdersGeneralItemsDeliveryCartBankTransfer,
  postApiOrdersGeneralItemsDeliveryCartTossConfirm,
  postApiOrdersGeneralItemsDeliveryCartTossTickets,
  get as getAdminShippingPolicy,
  update as updateAdminShippingPolicy,
} from "@/apis/generated/api";
```

- [ ] **Step 5: Commit generated API**

Run:

```powershell
git add src/apis/generated/api.ts
git commit -m "API 클라이언트 재생성"
```

Expected: generated API changes are committed alone.

---

### Task 2: Cart Token Utilities

**Files:**
- Create: `src/app/(main)/general-items/cart/_lib/cart-token.ts`
- Create: `src/app/(main)/general-items/cart/_lib/cart-token.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/(main)/general-items/cart/_lib/cart-token.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_lib/cart-token.test.ts"
```

Expected: FAIL because `cart-token.ts` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/app/(main)/general-items/cart/_lib/cart-token.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_lib/cart-token.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/_lib/cart-token.ts" "src/app/(main)/general-items/cart/_lib/cart-token.test.ts"
git commit -m "장바구니 토큰 유틸 추가"
```

---

### Task 3: Cart Quote and Display Utilities

**Files:**
- Create: `src/app/(main)/general-items/cart/_lib/cart-utils.ts`
- Create: `src/app/(main)/general-items/cart/_lib/cart-utils.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/(main)/general-items/cart/_lib/cart-utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  canCheckoutCart,
  formatCartCurrency,
  getCartBlockingReason,
  getValidCartItems,
  normalizeCartQuantity,
} from "./cart-utils";

const quote = {
  items: [
    { cartItemId: 1, itemName: "A", quantity: 1, valid: true },
    { cartItemId: 2, itemName: "B", quantity: 1, valid: false, invalidReason: "판매 종료" },
  ],
  itemsTotalPrice: 10000,
  shippingFee: 3000,
  totalPrice: 13000,
};

describe("cart utilities", () => {
  it("keeps cart quantity inside the allowed range", () => {
    expect(normalizeCartQuantity(0, 5)).toBe(1);
    expect(normalizeCartQuantity(7, 5)).toBe(5);
    expect(normalizeCartQuantity(Number.NaN, 5)).toBe(1);
  });

  it("returns only valid cart items", () => {
    expect(getValidCartItems(quote)).toHaveLength(1);
    expect(getValidCartItems(quote)[0].cartItemId).toBe(1);
  });

  it("blocks checkout when the cart has no valid items", () => {
    expect(canCheckoutCart(quote)).toBe(true);
    expect(getCartBlockingReason({ items: [] })).toBe("장바구니에 담긴 상품이 없습니다.");
    expect(getCartBlockingReason({ items: [{ cartItemId: 1, valid: false, invalidReason: "품절" }] })).toBe(
      "주문 가능한 상품이 없습니다.",
    );
  });

  it("formats currency safely", () => {
    expect(formatCartCurrency(13000)).toBe("13,000원");
    expect(formatCartCurrency(undefined)).toBe("-");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_lib/cart-utils.test.ts"
```

Expected: FAIL because `cart-utils.ts` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/app/(main)/general-items/cart/_lib/cart-utils.ts`:

```ts
import type { CartItemResponse, CartQuoteResponse } from "@/apis/generated/api";

export function normalizeCartQuantity(value: number, maxQuantity?: number): number {
  const parsed = Number.isFinite(value) ? Math.trunc(value) : 1;
  const upperLimit = maxQuantity && maxQuantity > 0 ? maxQuantity : Number.MAX_SAFE_INTEGER;
  return Math.min(Math.max(parsed, 1), upperLimit);
}

export function getValidCartItems(quote?: Pick<CartQuoteResponse, "items"> | null): CartItemResponse[] {
  return (quote?.items ?? []).filter((item) => item.valid !== false);
}

export function canCheckoutCart(quote?: Pick<CartQuoteResponse, "items"> | null): boolean {
  return getValidCartItems(quote).length > 0;
}

export function getCartBlockingReason(quote?: Pick<CartQuoteResponse, "items"> | null): string | undefined {
  const items = quote?.items ?? [];
  if (items.length === 0) return "장바구니에 담긴 상품이 없습니다.";
  if (!canCheckoutCart(quote)) return "주문 가능한 상품이 없습니다.";
  return undefined;
}

export function formatCartCurrency(value?: number): string {
  if (value == null) return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_lib/cart-utils.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/_lib/cart-utils.ts" "src/app/(main)/general-items/cart/_lib/cart-utils.test.ts"
git commit -m "장바구니 표시 유틸 추가"
```

---

### Task 4: Cart Server Actions

**Files:**
- Create: `src/app/(main)/general-items/cart/actions.ts`
- Create: `src/app/(main)/general-items/cart/actions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/(main)/general-items/cart/actions.test.ts`:

```ts
import { addItem, deleteItem, getCurrent, quote, updateQuantity } from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addGeneralItemToCart, removeCartItem, updateCartItemQuantity } from "./actions";

vi.mock("@/apis/generated/api", () => ({
  addItem: vi.fn(),
  deleteItem: vi.fn(),
  getCurrent: vi.fn(),
  quote: vi.fn(),
  updateQuantity: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const cookieSet = vi.fn();
const cookieDelete = vi.fn();
const cookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const mockedCookies = vi.mocked(cookies);
const mockedGetAuthToken = vi.mocked(getAuthToken);
const mockedAddItem = vi.mocked(addItem);
const mockedUpdateQuantity = vi.mocked(updateQuantity);
const mockedDeleteItem = vi.mocked(deleteItem);

describe("cart actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockReturnValue({ value: "cart-token" });
    mockedCookies.mockResolvedValue({
      get: cookieGet,
      set: cookieSet,
      delete: cookieDelete,
    } as never);
    mockedGetAuthToken.mockResolvedValue("access-token");
  });

  it("validates add-to-cart input before calling API", async () => {
    const result = await addGeneralItemToCart({ saleAnnouncementId: 0, quantity: 1 });

    expect(result.success).toBe(false);
    expect(result.error).toBe("판매 공고 정보가 올바르지 않습니다.");
    expect(mockedAddItem).not.toHaveBeenCalled();
  });

  it("adds an item with auth and cart token headers then stores the returned token", async () => {
    mockedAddItem.mockResolvedValue({
      data: { cartId: 1, cartToken: "new-cart-token", items: [] },
      status: 200,
      headers: new Headers(),
    });

    const result = await addGeneralItemToCart({ saleAnnouncementId: 1001, quantity: 2 });

    expect(result).toEqual({ success: true, data: { cartId: 1, cartToken: "new-cart-token", items: [] } });
    expect(mockedAddItem).toHaveBeenCalledWith(
      { saleAnnouncementId: 1001, quantity: 2 },
      {
        headers: {
          Authorization: "Bearer access-token",
          "X-Cart-Token": "cart-token",
        },
      },
    );
    expect(cookieSet).toHaveBeenCalledWith(
      "wn_cart_token",
      "new-cart-token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/general-items/cart");
  });

  it("updates quantity with the cart token header", async () => {
    mockedUpdateQuantity.mockResolvedValue({ data: { cartId: 1, items: [] }, status: 200, headers: new Headers() });

    await expect(updateCartItemQuantity(10, 3)).resolves.toMatchObject({ success: true });
    expect(mockedUpdateQuantity).toHaveBeenCalledWith(10, { quantity: 3 }, expect.any(Object));
  });

  it("removes a cart item and revalidates cart pages", async () => {
    mockedDeleteItem.mockResolvedValue({ data: { cartId: 1, items: [] }, status: 200, headers: new Headers() });

    await expect(removeCartItem(10)).resolves.toMatchObject({ success: true });
    expect(mockedDeleteItem).toHaveBeenCalledWith(10, expect.any(Object));
    expect(revalidatePath).toHaveBeenCalledWith("/general-items/cart");
    expect(revalidatePath).toHaveBeenCalledWith("/general-items/cart/order");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/actions.test.ts"
```

Expected: FAIL because `actions.ts` does not exist.

- [ ] **Step 3: Implement the actions**

Create `src/app/(main)/general-items/cart/actions.ts`:

```ts
"use server";

import { getUserErrorMessage } from "@/apis/errors";
import {
  addItem,
  deleteItem,
  getCurrent,
  quote,
  updateQuantity,
  type CartQuoteResponse,
  type CartResponse,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import {
  buildCartHeaders,
  CART_TOKEN_COOKIE,
  getCartTokenCookieOptions,
  getResponseCartToken,
} from "./_lib/cart-token";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

const addCartItemSchema = z.object({
  saleAnnouncementId: z.number().int().positive("판매 공고 정보가 올바르지 않습니다."),
  quantity: z.number().int().positive("수량을 다시 선택해 주세요."),
});

const cartItemIdSchema = z.number().int().positive("장바구니 항목 정보가 올바르지 않습니다.");
const quantitySchema = z.number().int().positive("수량을 다시 선택해 주세요.");

async function buildCartOptions(idempotencyKey?: string): Promise<RequestInit | undefined> {
  const cookieStore = await cookies();
  const authToken = await getAuthToken();
  const headers = buildCartHeaders({
    authToken,
    cartToken: cookieStore.get(CART_TOKEN_COOKIE)?.value,
    idempotencyKey,
  });

  return Object.keys(headers).length > 0 ? { headers } : undefined;
}

async function persistCartTokenFromResponse(value: unknown) {
  const token = getResponseCartToken(value);
  if (!token) return;

  const cookieStore = await cookies();
  cookieStore.set(CART_TOKEN_COOKIE, token, getCartTokenCookieOptions());
}

function cartError(error: unknown, fallback: string): string {
  const message = getUserErrorMessage(error, fallback);
  if (message.includes("cartToken") || message.includes("Cart token")) {
    return "장바구니 정보가 만료되었습니다. 상품을 다시 담아 주세요.";
  }
  if (message.includes("남은 수량") || message.includes("Insufficient available quantity")) {
    return "남은 수량이 부족합니다. 수량을 다시 선택해 주세요.";
  }
  return message;
}

export async function fetchCurrentCart(): Promise<ActionResult<CartResponse>> {
  try {
    const response = await getCurrent(await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: cartError(error, "장바구니를 불러오지 못했습니다.") };
  }
}

export async function fetchCartQuote(): Promise<ActionResult<CartQuoteResponse>> {
  try {
    const response = await quote(await buildCartOptions());
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: cartError(error, "장바구니 견적을 불러오지 못했습니다.") };
  }
}

export async function addGeneralItemToCart(input: {
  saleAnnouncementId: number;
  quantity: number;
}): Promise<ActionResult<CartResponse>> {
  try {
    const parsed = addCartItemSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const response = await addItem(parsed.data, await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    revalidatePath("/general-items/cart");
    revalidatePath("/general-items/cart/order");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: cartError(error, "장바구니 담기에 실패했습니다.") };
  }
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<ActionResult<CartResponse>> {
  try {
    const parsedCartItemId = cartItemIdSchema.safeParse(cartItemId);
    if (!parsedCartItemId.success) return { success: false, error: parsedCartItemId.error.issues[0].message };

    const parsedQuantity = quantitySchema.safeParse(quantity);
    if (!parsedQuantity.success) return { success: false, error: parsedQuantity.error.issues[0].message };

    const response = await updateQuantity(parsedCartItemId.data, { quantity: parsedQuantity.data }, await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    revalidatePath("/general-items/cart");
    revalidatePath("/general-items/cart/order");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: cartError(error, "수량 변경에 실패했습니다.") };
  }
}

export async function removeCartItem(cartItemId: number): Promise<ActionResult<CartResponse>> {
  try {
    const parsed = cartItemIdSchema.safeParse(cartItemId);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const response = await deleteItem(parsed.data, await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    revalidatePath("/general-items/cart");
    revalidatePath("/general-items/cart/order");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: cartError(error, "장바구니 항목 삭제에 실패했습니다.") };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/actions.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/actions.ts" "src/app/(main)/general-items/cart/actions.test.ts"
git commit -m "장바구니 서버 액션 추가"
```

---

### Task 5: Product Detail Add-To-Cart UX

**Files:**
- Modify: `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.tsx`
- Create: `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addGeneralItemToCart } from "../../cart/actions";
import GeneralItemOrderForm from "./GeneralItemOrderForm";

vi.mock("../../cart/actions", () => ({
  addGeneralItemToCart: vi.fn(),
}));

const mockedAddToCart = vi.mocked(addGeneralItemToCart);

describe("GeneralItemOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps direct order submit and adds selected quantity to cart", async () => {
    mockedAddToCart.mockResolvedValue({ success: true, data: { cartId: 1, items: [] } });

    render(<GeneralItemOrderForm saleAnnouncementId={1001} itemName="테스트 상품" unitPrice={12000} quantityLimit={5} />);

    await userEvent.click(screen.getByRole("button", { name: "수량 증가" }));
    await userEvent.click(screen.getByRole("button", { name: "장바구니 담기" }));

    expect(mockedAddToCart).toHaveBeenCalledWith({ saleAnnouncementId: 1001, quantity: 2 });
    expect(await screen.findByText("장바구니에 상품을 담았습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "장바구니 보기" })).toHaveAttribute("href", "/general-items/cart");
    expect(screen.getByRole("button", { name: "바로 주문" })).toHaveAttribute("type", "submit");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx"
```

Expected: FAIL because the component has no `장바구니 담기` button.

- [ ] **Step 3: Implement the UI change**

Modify `src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addGeneralItemToCart } from "../../cart/actions";
import { normalizeGeneralItemOrderQuantity } from "../../_lib/general-item-sales";

interface GeneralItemOrderFormProps {
  saleAnnouncementId: number;
  itemName: string;
  unitPrice?: number;
  quantityLimit: number;
}

export default function GeneralItemOrderForm({
  saleAnnouncementId,
  itemName,
  unitPrice,
  quantityLimit,
}: GeneralItemOrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(normalizeGeneralItemOrderQuantity(nextQuantity, quantityLimit));
  };

  const handleAddToCart = () => {
    setCartMessage(null);
    setCartError(null);

    startTransition(async () => {
      const result = await addGeneralItemToCart({ saleAnnouncementId, quantity });
      if (result.success) {
        setCartMessage("장바구니에 상품을 담았습니다.");
      } else {
        setCartError(result.error ?? "장바구니 담기에 실패했습니다.");
      }
    });
  };

  return (
    <form action="/general-items/delivery-order" method="get" className="grid gap-4">
      <input type="hidden" name="saleAnnouncementId" value={saleAnnouncementId} />
      <input type="hidden" name="itemName" value={itemName} />
      <input type="hidden" name="unitPrice" value={unitPrice ?? ""} />

      <div>
        <div className="flex w-full items-center justify-between gap-4">
          <label className="shrink-0 text-sm font-medium text-gray-200" htmlFor="quantity">
            수량
          </label>
          <div className="flex w-fit items-center border border-white/15 bg-black/20">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              className="h-7 w-10 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:text-gray-600"
              disabled={quantity <= 1}
              aria-label="수량 감소"
            >
              -
            </button>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={quantityLimit}
              value={quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              required
              className="h-7 w-14 border-x border-white/15 bg-transparent px-2 text-center text-white outline-none focus:bg-white/5"
            />
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              className="h-7 w-10 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:text-gray-600"
              disabled={quantity >= quantityLimit}
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-2 text-right text-xs text-gray-400">
          최대 {quantityLimit.toLocaleString("ko-KR")}개까지 선택할 수 있습니다.
        </p>
      </div>

      {cartMessage && (
        <div className="border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          <p>{cartMessage}</p>
          <div className="mt-2 flex gap-3">
            <Link href="/general-items/cart" className="font-semibold text-amber-200 underline underline-offset-4">
              장바구니 보기
            </Link>
            <button type="button" className="text-gray-300" onClick={() => setCartMessage(null)}>
              계속 쇼핑
            </button>
          </div>
        </div>
      )}

      {cartError && <p className="border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{cartError}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isPending}
          className="w-full border border-white/20 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          {isPending ? "담는 중" : "장바구니 담기"}
        </button>
        <button
          type="submit"
          className="w-full bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700"
        >
          바로 주문
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx"
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.tsx" "src/app/(main)/general-items/[saleId]/_components/GeneralItemOrderForm.test.tsx"
git commit -m "상품 상세 장바구니 담기 추가"
```

---

### Task 6: Cart Page

**Files:**
- Create: `src/app/(main)/general-items/cart/_components/CartContent.tsx`
- Create: `src/app/(main)/general-items/cart/_components/CartContent.test.tsx`
- Create: `src/app/(main)/general-items/cart/page.tsx`

- [ ] **Step 1: Write the failing component test**

Create `src/app/(main)/general-items/cart/_components/CartContent.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CartContent from "./CartContent";

vi.mock("../actions", () => ({
  removeCartItem: vi.fn(),
  updateCartItemQuantity: vi.fn(),
}));

describe("CartContent", () => {
  it("shows empty state when quote has no items", () => {
    render(<CartContent quote={{ items: [] }} error={null} />);

    expect(screen.getByText("장바구니에 담긴 상품이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "주문서로 이동" })).not.toBeInTheDocument();
  });

  it("shows invalid reasons and disables checkout when every item is invalid", () => {
    render(
      <CartContent
        quote={{
          items: [{ cartItemId: 1, itemName: "품절 상품", quantity: 1, unitPrice: 10000, valid: false, invalidReason: "품절" }],
          itemsTotalPrice: 10000,
          shippingFee: 3000,
          totalPrice: 13000,
        }}
        error={null}
      />,
    );

    expect(screen.getByText("품절")).toBeInTheDocument();
    expect(screen.getByText("주문 가능한 상품이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "주문서로 이동" })).not.toBeInTheDocument();
  });

  it("renders quote totals and checkout link for valid cart", () => {
    render(
      <CartContent
        quote={{
          items: [{ cartItemId: 1, itemName: "테스트 상품", quantity: 2, unitPrice: 10000, lineTotalPrice: 20000, valid: true }],
          itemsTotalPrice: 20000,
          shippingFee: 3000,
          freeShippingThreshold: 50000,
          freeShippingRemainingAmount: 30000,
          totalPrice: 23000,
        }}
        error={null}
      />,
    );

    expect(screen.getByText("테스트 상품")).toBeInTheDocument();
    expect(screen.getByText("상품 합계")).toBeInTheDocument();
    expect(screen.getByText("20,000원")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "주문서로 이동" })).toHaveAttribute("href", "/general-items/cart/order");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_components/CartContent.test.tsx"
```

Expected: FAIL because `CartContent.tsx` does not exist.

- [ ] **Step 3: Implement `CartContent`**

Create `src/app/(main)/general-items/cart/_components/CartContent.tsx`:

```tsx
"use client";

import type { CartItemResponse, CartQuoteResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useTransition } from "react";
import { removeCartItem, updateCartItemQuantity } from "../actions";
import { canCheckoutCart, formatCartCurrency, getCartBlockingReason, normalizeCartQuantity } from "../_lib/cart-utils";

interface CartContentProps {
  quote?: CartQuoteResponse;
  error: string | null;
}

function CartItemRow({ item }: { item: CartItemResponse }) {
  const [quantity, setQuantity] = useState(item.quantity ?? 1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const maxQuantity = item.maxOrderQuantity ?? item.availableQuantity;

  const changeQuantity = (nextValue: number) => {
    const nextQuantity = normalizeCartQuantity(nextValue, maxQuantity);
    setQuantity(nextQuantity);
    setError(null);
    if (!item.cartItemId) return;

    startTransition(async () => {
      const result = await updateCartItemQuantity(item.cartItemId!, nextQuantity);
      if (!result.success) setError(result.error ?? "수량 변경에 실패했습니다.");
    });
  };

  const remove = () => {
    if (!item.cartItemId) return;
    setError(null);
    startTransition(async () => {
      const result = await removeCartItem(item.cartItemId!);
      if (!result.success) setError(result.error ?? "삭제에 실패했습니다.");
    });
  };

  return (
    <li className="border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="typo-bold-18 text-white">{item.itemName ?? "일반상품"}</h2>
          <p className="mt-2 text-sm text-gray-400">단가 {formatCartCurrency(item.unitPrice)}</p>
          {item.valid === false && (
            <p className="mt-3 border border-red-400/30 bg-red-400/10 p-2 text-sm text-red-100">
              {item.invalidReason ?? "주문할 수 없는 상품입니다."}
            </p>
          )}
        </div>
        <div className="grid gap-3 md:min-w-52">
          <div className="flex items-center justify-between border border-white/15 bg-black/20">
            <button
              type="button"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={quantity <= 1 || isPending}
              className="h-9 w-10 text-white disabled:text-gray-600"
              aria-label={`${item.itemName ?? "상품"} 수량 감소`}
            >
              -
            </button>
            <span className="px-3 text-sm text-white">{quantity.toLocaleString("ko-KR")}개</span>
            <button
              type="button"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={isPending || (maxQuantity != null && quantity >= maxQuantity)}
              className="h-9 w-10 text-white disabled:text-gray-600"
              aria-label={`${item.itemName ?? "상품"} 수량 증가`}
            >
              +
            </button>
          </div>
          <p className="text-right text-sm font-semibold text-white">{formatCartCurrency(item.lineTotalPrice)}</p>
          <Button type="button" variant="outline" onClick={remove} disabled={isPending}>
            삭제
          </Button>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
    </li>
  );
}

export default function CartContent({ quote, error }: CartContentProps) {
  const blockingReason = getCartBlockingReason(quote);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_320px] md:py-16">
      <section>
        <p className="text-sm text-amber-300">GENERAL / ITEM 장바구니</p>
        <h1 className="typo-bold-24 mt-2 text-white md:text-3xl">장바구니</h1>
        {error && <p className="mt-5 border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        {blockingReason === "장바구니에 담긴 상품이 없습니다." ? (
          <div className="mt-8 border border-white/10 bg-white/5 p-8 text-center text-gray-300">
            장바구니에 담긴 상품이 없습니다.
          </div>
        ) : (
          <ul className="mt-8 grid gap-4">
            {(quote?.items ?? []).map((item) => (
              <CartItemRow key={item.cartItemId ?? item.saleAnnouncementId ?? item.itemName} item={item} />
            ))}
          </ul>
        )}
      </section>

      <aside className="h-fit border border-white/10 bg-black/20 p-5">
        <h2 className="typo-bold-18 text-white">주문 요약</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400">상품 합계</dt>
            <dd className="text-white">{formatCartCurrency(quote?.itemsTotalPrice)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400">배송비</dt>
            <dd className="text-white">{formatCartCurrency(quote?.shippingFee)}</dd>
          </div>
          {quote?.freeShipping === false && quote.freeShippingRemainingAmount != null && (
            <p className="text-xs leading-5 text-amber-200">
              {formatCartCurrency(quote.freeShippingRemainingAmount)} 추가 주문 시 무료배송
            </p>
          )}
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-200">총 결제 금액</dt>
              <dd className="font-bold text-white">{formatCartCurrency(quote?.totalPrice)}</dd>
            </div>
          </div>
        </dl>

        {canCheckoutCart(quote) ? (
          <Button asChild className="mt-6 w-full bg-amber-600 hover:bg-amber-700">
            <Link href="/general-items/cart/order">주문서로 이동</Link>
          </Button>
        ) : (
          <p className="mt-6 border border-white/10 bg-white/5 p-3 text-sm text-gray-300">{blockingReason}</p>
        )}
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Implement the page**

Create `src/app/(main)/general-items/cart/page.tsx`:

```tsx
import { fetchCartQuote } from "./actions";
import CartContent from "./_components/CartContent";

export default async function GeneralItemCartPage() {
  const quoteResult = await fetchCartQuote();

  return (
    <main className="min-h-screen bg-[#1d2429] pt-16 text-white lg:pt-20">
      <CartContent quote={quoteResult.data} error={quoteResult.success ? null : (quoteResult.error ?? null)} />
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/_components/CartContent.test.tsx"
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/_components/CartContent.tsx" "src/app/(main)/general-items/cart/_components/CartContent.test.tsx" "src/app/(main)/general-items/cart/page.tsx"
git commit -m "장바구니 화면 추가"
```

---

### Task 7: Cart Order Actions

**Files:**
- Create: `src/app/(main)/general-items/cart/order/actions.ts`
- Create: `src/app/(main)/general-items/cart/order/actions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/(main)/general-items/cart/order/actions.test.ts`:

```ts
import {
  postApiOrdersGeneralItemsDeliveryCartBankTransfer,
  postApiOrdersGeneralItemsDeliveryCartTossConfirm,
  postApiOrdersGeneralItemsDeliveryCartTossTickets,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmCartTossPayment,
  createCartBankTransferOrder,
  createCartTossTicket,
} from "./actions";

vi.mock("@/apis/generated/api", () => ({
  postApiOrdersGeneralItemsDeliveryCartBankTransfer: vi.fn(),
  postApiOrdersGeneralItemsDeliveryCartTossConfirm: vi.fn(),
  postApiOrdersGeneralItemsDeliveryCartTossTickets: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const cookieGet = vi.fn();
const cookieDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

const validInput = {
  receiverName: "홍길동",
  receiverPhone: "010-1234-5678",
  deliveryAddress: "서울특별시 중구",
  deliveryMemo: "문 앞",
  orderNote: "선물",
  guestEmail: "guest@example.com",
};

describe("cart order actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue({ get: cookieGet, delete: cookieDelete } as never);
    cookieGet.mockReturnValue({ value: "cart-token" });
    vi.mocked(getAuthToken).mockResolvedValue(undefined);
  });

  it("validates required delivery address before cart bank transfer order", async () => {
    const result = await createCartBankTransferOrder({ ...validInput, deliveryAddress: "" }, "idem-1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("배송 주소를 입력해주세요.");
    expect(postApiOrdersGeneralItemsDeliveryCartBankTransfer).not.toHaveBeenCalled();
  });

  it("creates a cart bank transfer order with cart token and idempotency key", async () => {
    vi.mocked(postApiOrdersGeneralItemsDeliveryCartBankTransfer).mockResolvedValue({
      data: { order: { id: 10, orderNumber: "ODR-1" } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createCartBankTransferOrder(validInput, "idem-1");

    expect(result.success).toBe(true);
    expect(postApiOrdersGeneralItemsDeliveryCartBankTransfer).toHaveBeenCalledWith(validInput, {
      headers: {
        "Idempotency-Key": "idem-1",
        "X-Cart-Token": "cart-token",
      },
    });
    expect(cookieDelete).toHaveBeenCalledWith("wn_cart_token");
  });

  it("issues a cart Toss ticket", async () => {
    vi.mocked(postApiOrdersGeneralItemsDeliveryCartTossTickets).mockResolvedValue({
      data: { ticket: { pgOrderId: "PG-1", amount: 23000 } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createCartTossTicket(validInput, "idem-2");

    expect(result.success).toBe(true);
    expect(postApiOrdersGeneralItemsDeliveryCartTossTickets).toHaveBeenCalledWith(validInput, {
      headers: {
        "Idempotency-Key": "idem-2",
        "X-Cart-Token": "cart-token",
      },
    });
  });

  it("confirms cart Toss payment using pgOrderId mapping", async () => {
    vi.mocked(postApiOrdersGeneralItemsDeliveryCartTossConfirm).mockResolvedValue({
      data: { order: { id: 11, orderNumber: "ODR-2" }, paidAmount: 23000 },
      status: 200,
      headers: new Headers(),
    });

    const result = await confirmCartTossPayment({ orderId: "PG-1", paymentKey: "pay-key", amount: "23000" });

    expect(result.success).toBe(true);
    expect(postApiOrdersGeneralItemsDeliveryCartTossConfirm).toHaveBeenCalledWith({
      pgOrderId: "PG-1",
      paymentKey: "pay-key",
      amount: 23000,
    });
    expect(cookieDelete).toHaveBeenCalledWith("wn_cart_token");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/order/actions.test.ts"
```

Expected: FAIL because `actions.ts` does not exist.

- [ ] **Step 3: Implement cart order actions**

Create `src/app/(main)/general-items/cart/order/actions.ts`:

```ts
"use server";

import { getUserErrorMessage } from "@/apis/errors";
import {
  postApiOrdersGeneralItemsDeliveryCartBankTransfer,
  postApiOrdersGeneralItemsDeliveryCartTossConfirm,
  postApiOrdersGeneralItemsDeliveryCartTossTickets,
  type GeneralItemDeliveryOrderResponse,
  type GeneralItemDeliveryTicketResponse,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { buildCartHeaders, CART_TOKEN_COOKIE } from "../_lib/cart-token";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CartDeliveryOrderInput = {
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryMemo?: string;
  orderNote?: string;
  guestEmail: string;
};

const orderInputSchema = z.object({
  receiverName: z.string().trim().min(1, "수령인 이름을 입력해주세요.").max(100),
  receiverPhone: z.string().trim().min(1, "수령인 연락처를 입력해주세요.").max(20),
  deliveryAddress: z.string().trim().min(1, "배송 주소를 입력해주세요.").max(500),
  deliveryMemo: z.string().trim().max(500).optional(),
  orderNote: z.string().trim().max(500).optional(),
  guestEmail: z
    .string()
    .trim()
    .min(1, "주문 안내를 받을 이메일을 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다.")
    .max(100),
});

const tossConfirmSchema = z.object({
  orderId: z.string().trim().min(1, "토스 주문번호가 없습니다."),
  paymentKey: z.string().trim().min(1, "토스 결제 키가 없습니다."),
  amount: z.coerce.number().int().positive("결제 금액이 올바르지 않습니다."),
});

function normalizeOptionalText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOrderInput(input: CartDeliveryOrderInput): CartDeliveryOrderInput {
  return {
    receiverName: input.receiverName.trim(),
    receiverPhone: input.receiverPhone.trim(),
    deliveryAddress: input.deliveryAddress.trim(),
    deliveryMemo: normalizeOptionalText(input.deliveryMemo),
    orderNote: normalizeOptionalText(input.orderNote),
    guestEmail: input.guestEmail.trim(),
  };
}

async function buildOptions(idempotencyKey?: string): Promise<RequestInit | undefined> {
  const cookieStore = await cookies();
  const authToken = await getAuthToken();
  const headers = buildCartHeaders({
    authToken,
    cartToken: cookieStore.get(CART_TOKEN_COOKIE)?.value,
    idempotencyKey,
  });
  return Object.keys(headers).length > 0 ? { headers } : undefined;
}

async function clearCartToken() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_TOKEN_COOKIE);
}

function orderError(error: unknown, fallback: string): string {
  const message = getUserErrorMessage(error, fallback);
  if (message.includes("장바구니") || message.includes("cart")) {
    return "장바구니 정보를 확인할 수 없습니다. 장바구니를 다시 확인해 주세요.";
  }
  if (message.includes("주문 티켓이 만료")) {
    return "결제 가능 시간이 만료되었습니다. 주문을 다시 시도해 주세요.";
  }
  return message;
}

export async function createCartBankTransferOrder(
  input: CartDeliveryOrderInput,
  idempotencyKey: string,
): Promise<ActionResult<GeneralItemDeliveryOrderResponse>> {
  try {
    const parsed = orderInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const response = await postApiOrdersGeneralItemsDeliveryCartBankTransfer(
      normalizeOrderInput(parsed.data),
      await buildOptions(idempotencyKey),
    );
    await clearCartToken();
    revalidatePath("/general-items/cart");
    revalidatePath("/general-items/cart/order");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: orderError(error, "계좌이체 주문 생성에 실패했습니다.") };
  }
}

export async function createCartTossTicket(
  input: CartDeliveryOrderInput,
  idempotencyKey: string,
): Promise<ActionResult<GeneralItemDeliveryTicketResponse>> {
  try {
    const parsed = orderInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const response = await postApiOrdersGeneralItemsDeliveryCartTossTickets(
      normalizeOrderInput(parsed.data),
      await buildOptions(idempotencyKey),
    );
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: orderError(error, "토스 결제 준비에 실패했습니다.") };
  }
}

export async function confirmCartTossPayment(input: {
  orderId?: string;
  paymentKey?: string;
  amount?: string;
}): Promise<ActionResult<GeneralItemDeliveryOrderResponse>> {
  try {
    const parsed = tossConfirmSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const response = await postApiOrdersGeneralItemsDeliveryCartTossConfirm({
      pgOrderId: parsed.data.orderId,
      paymentKey: parsed.data.paymentKey,
      amount: parsed.data.amount,
    });
    await clearCartToken();
    revalidatePath("/general-items/cart");
    revalidatePath("/general-items/cart/order");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, error: orderError(error, "토스 결제 확정에 실패했습니다.") };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/order/actions.test.ts"
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/order/actions.ts" "src/app/(main)/general-items/cart/order/actions.test.ts"
git commit -m "장바구니 주문 액션 추가"
```

---

### Task 8: Cart Order Page and Toss Result Pages

**Files:**
- Create: `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.tsx`
- Create: `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.test.tsx`
- Create: `src/app/(main)/general-items/cart/order/page.tsx`
- Create: `src/app/(main)/general-items/cart/order/toss/success/page.tsx`
- Create: `src/app/(main)/general-items/cart/order/toss/success/TossSuccessClient.tsx`
- Create: `src/app/(main)/general-items/cart/order/toss/fail/page.tsx`

- [ ] **Step 1: Write the failing component test**

Create `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CartDeliveryOrderClient from "./CartDeliveryOrderClient";

vi.mock("./actions", () => ({
  createCartBankTransferOrder: vi.fn(),
  createCartTossTicket: vi.fn(),
}));

vi.mock("../../delivery-order/actions", () => ({
  createDeliveryAddress: vi.fn(),
}));

describe("CartDeliveryOrderClient", () => {
  it("renders cart quote totals and cart payment buttons", () => {
    render(
      <CartDeliveryOrderClient
        quote={{
          items: [{ cartItemId: 1, itemName: "테스트 상품", quantity: 2, valid: true }],
          itemsTotalPrice: 20000,
          shippingFee: 3000,
          totalPrice: 23000,
        }}
        currentUser={null}
        deliveryAddresses={[]}
      />,
    );

    expect(screen.getByText("장바구니 배송 주문서")).toBeInTheDocument();
    expect(screen.getByText("23,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "계좌이체 주문" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "토스 결제" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.test.tsx"
```

Expected: FAIL because `CartDeliveryOrderClient.tsx` does not exist.

- [ ] **Step 3: Implement `CartDeliveryOrderClient`**

Create `src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.tsx` by copying the address UX and Toss SDK loader shape from `src/app/(main)/general-items/delivery-order/GeneralItemDeliveryOrderClient.tsx`, then make these exact changes:

```tsx
import type { CartQuoteResponse, DeliveryAddressResponse, OrderTicketResponse, UserSelfResponse } from "@/apis/generated/api";
import OrderCompletionPanel from "../../delivery-order/_components/OrderCompletionPanel";
import { createDeliveryAddress } from "../../delivery-order/actions";
import { formatCartCurrency } from "../_lib/cart-utils";
import { createCartBankTransferOrder, createCartTossTicket, type CartDeliveryOrderInput } from "./actions";
```

The form state must use this shape:

```ts
const [form, setForm] = useState({
  receiverName: "",
  receiverPhone: "",
  deliveryAddress: "",
  deliveryMemo: "",
  orderNote: "",
  guestEmail: "",
});
```

The request body builder must use this exact function:

```ts
const buildInput = (): CartDeliveryOrderInput => ({
  receiverName: form.receiverName,
  receiverPhone: form.receiverPhone,
  deliveryAddress: form.deliveryAddress,
  deliveryMemo: form.deliveryMemo,
  orderNote: form.orderNote,
  guestEmail: form.guestEmail,
});
```

The summary aside must render `quote.itemsTotalPrice`, `quote.shippingFee`, and `quote.totalPrice` with `formatCartCurrency`.

- [ ] **Step 4: Implement the order page**

Create `src/app/(main)/general-items/cart/order/page.tsx`:

```tsx
import {
  getApiUsersMe,
  getApiUsersMeDeliveryAddresses,
  type DeliveryAddressResponse,
  type UserSelfResponse,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchCartQuote } from "../actions";
import { canCheckoutCart } from "../_lib/cart-utils";
import CartDeliveryOrderClient from "./CartDeliveryOrderClient";

export default async function GeneralItemCartOrderPage() {
  const quoteResult = await fetchCartQuote();
  if (!quoteResult.data || !canCheckoutCart(quoteResult.data)) {
    redirect("/general-items/cart");
  }

  const token = await getAuthToken();
  let currentUser: UserSelfResponse | null = null;
  let deliveryAddresses: DeliveryAddressResponse[] = [];

  if (token) {
    const options = withToken(token);
    const [userResult, addressResult] = await Promise.allSettled([
      getApiUsersMe(options),
      getApiUsersMeDeliveryAddresses(options),
    ]);

    if (userResult.status === "fulfilled") currentUser = userResult.value.data;
    if (addressResult.status === "fulfilled") deliveryAddresses = addressResult.value.data;
  }

  return (
    <main className="min-h-screen bg-[#1d2429] pt-16 text-white lg:pt-20">
      <CartDeliveryOrderClient
        quote={quoteResult.data}
        currentUser={currentUser}
        deliveryAddresses={deliveryAddresses}
      />
    </main>
  );
}
```

- [ ] **Step 5: Implement Toss success page**

Create `src/app/(main)/general-items/cart/order/toss/success/page.tsx`:

```tsx
import TossSuccessClient from "./TossSuccessClient";

interface TossSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
  }>;
}

export default async function CartTossSuccessPage({ searchParams }: TossSuccessPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#1d2429] text-white">
      <TossSuccessClient orderId={params.orderId} paymentKey={params.paymentKey} amount={params.amount} />
    </main>
  );
}
```

Create `src/app/(main)/general-items/cart/order/toss/success/TossSuccessClient.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import OrderCompletionPanel from "../../../../delivery-order/_components/OrderCompletionPanel";
import { confirmCartTossPayment } from "../../actions";

interface TossSuccessClientProps {
  orderId?: string;
  paymentKey?: string;
  amount?: string;
}

type ConfirmResult = Awaited<ReturnType<typeof confirmCartTossPayment>>;

export default function TossSuccessClient({ orderId, paymentKey, amount }: TossSuccessClientProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ConfirmResult | null>(null);

  const confirm = () => {
    startTransition(async () => {
      setResult(await confirmCartTossPayment({ orderId, paymentKey, amount }));
    });
  };

  useEffect(() => {
    confirm();
    // Toss redirect params are fixed for this page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      {isPending && (
        <div className="border border-white/10 bg-white/5 p-8 text-center text-white">결제를 확정하는 중입니다.</div>
      )}

      {!isPending && result?.success && result.data && <OrderCompletionPanel result={result.data} />}

      {!isPending && result && !result.success && (
        <div className="border border-red-400/30 bg-red-400/10 p-6">
          <h1 className="typo-bold-24 text-white">결제 확정에 실패했습니다.</h1>
          <p className="mt-3 text-sm text-red-100">{result.error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={confirm} className="bg-amber-600 hover:bg-amber-700">
              같은 결제 정보로 다시 확정
            </Button>
            <Button asChild variant="outline">
              <Link href="/general-items/cart/order">주문서로 돌아가기</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement Toss fail page**

Create `src/app/(main)/general-items/cart/order/toss/fail/page.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TossFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function CartTossFailPage({ searchParams }: TossFailPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#1d2429] px-4 py-10 text-white md:py-16">
      <section className="mx-auto max-w-2xl border border-red-400/30 bg-red-400/10 p-6">
        <p className="text-sm text-red-200">{params.code ?? "PAYMENT_FAILED"}</p>
        <h1 className="typo-bold-24 mt-2">토스 결제가 완료되지 않았습니다.</h1>
        <p className="mt-4 text-sm leading-6 text-red-100">
          {params.message ?? "결제가 취소되었거나 인증에 실패했습니다. 주문서를 다시 확인해 주세요."}
        </p>
        {params.orderId && <p className="mt-3 font-mono text-xs text-red-100/70">PG 주문 ID: {params.orderId}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/general-items/cart/order">주문 다시 시도</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/general-items/cart">장바구니로 돌아가기</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 7: Run focused tests**

Run:

```powershell
corepack pnpm vitest run "src/app/(main)/general-items/cart/order/actions.test.ts" "src/app/(main)/general-items/cart/order/CartDeliveryOrderClient.test.tsx" "src/app/(main)/general-items/cart/_lib/cart-utils.test.ts"
```

Expected: PASS.

- [ ] **Step 8: Commit**

Run:

```powershell
git add "src/app/(main)/general-items/cart/order"
git commit -m "장바구니 주문서 화면 추가"
```

---

### Task 9: Admin Shipping Policy

**Files:**
- Create: `src/app/admin/shipping-policy/actions.ts`
- Create: `src/app/admin/shipping-policy/actions.test.ts`
- Create: `src/app/admin/shipping-policy/_components/ShippingPolicyContent.tsx`
- Create: `src/app/admin/shipping-policy/_components/ShippingPolicyContent.test.tsx`
- Create: `src/app/admin/shipping-policy/page.tsx`
- Modify: `src/app/admin/_components/AdminSidebar.tsx`

- [ ] **Step 1: Write the failing action test**

Create `src/app/admin/shipping-policy/actions.test.ts`:

```ts
import { update as updateAdminShippingPolicy } from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateShippingPolicyAction } from "./actions";

vi.mock("@/apis/generated/api", () => ({
  update: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function formDataFrom(entries: Record<string, string>) {
  const formData = new FormData();
  Object.entries(entries).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe("shipping policy actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockResolvedValue("admin-token");
  });

  it("rejects negative shipping fee", async () => {
    const result = await updateShippingPolicyAction(
      { success: false },
      formDataFrom({ enabled: "on", baseShippingFee: "-1", freeShippingThreshold: "50000" }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("기본 배송비는 0원 이상이어야 합니다.");
    expect(updateAdminShippingPolicy).not.toHaveBeenCalled();
  });

  it("updates shipping policy with admin token", async () => {
    vi.mocked(updateAdminShippingPolicy).mockResolvedValue({
      data: { enabled: true, baseShippingFee: 3000, freeShippingThreshold: 50000 },
      status: 200,
      headers: new Headers(),
    });

    const result = await updateShippingPolicyAction(
      { success: false },
      formDataFrom({ enabled: "on", baseShippingFee: "3000", freeShippingThreshold: "50000" }),
    );

    expect(result).toEqual({
      success: true,
      data: { enabled: true, baseShippingFee: 3000, freeShippingThreshold: 50000 },
    });
    expect(updateAdminShippingPolicy).toHaveBeenCalledWith(
      { enabled: true, baseShippingFee: 3000, freeShippingThreshold: 50000 },
      { headers: { Authorization: "Bearer admin-token" } },
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/shipping-policy");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/admin/shipping-policy/actions.test.ts"
```

Expected: FAIL because `actions.ts` does not exist.

- [ ] **Step 3: Implement admin action**

Create `src/app/admin/shipping-policy/actions.ts`:

```ts
"use server";

import { getUserErrorMessage } from "@/apis/errors";
import { update as updateAdminShippingPolicy, type ShippingPolicyResponse } from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

type ActionState = {
  success: boolean;
  data?: ShippingPolicyResponse;
  error?: string;
  values?: {
    enabled: boolean;
    baseShippingFee: string;
    freeShippingThreshold: string;
  };
};

const schema = z.object({
  enabled: z.boolean(),
  baseShippingFee: z.coerce.number().min(0, "기본 배송비는 0원 이상이어야 합니다."),
  freeShippingThreshold: z.coerce.number().min(0, "무료배송 기준 금액은 0원 이상이어야 합니다."),
});

export async function updateShippingPolicyAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const values = {
    enabled: formData.get("enabled") === "on",
    baseShippingFee: String(formData.get("baseShippingFee") ?? ""),
    freeShippingThreshold: String(formData.get("freeShippingThreshold") ?? ""),
  };

  try {
    const parsed = schema.safeParse({
      enabled: values.enabled,
      baseShippingFee: values.baseShippingFee,
      freeShippingThreshold: values.freeShippingThreshold,
    });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message, values };
    }

    const token = await getAuthToken();
    const response = await updateAdminShippingPolicy(parsed.data, {
      headers: token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {},
    });

    revalidatePath("/admin/shipping-policy");
    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "배송비 정책 저장에 실패했습니다."),
      values,
    };
  }
}
```

- [ ] **Step 4: Write the failing component test**

Create `src/app/admin/shipping-policy/_components/ShippingPolicyContent.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ShippingPolicyContent from "./ShippingPolicyContent";

vi.mock("../actions", () => ({
  updateShippingPolicyAction: vi.fn(),
}));

describe("ShippingPolicyContent", () => {
  it("renders policy values and submit control", async () => {
    render(<ShippingPolicyContent policy={{ enabled: true, baseShippingFee: 3000, freeShippingThreshold: 50000 }} />);

    expect(screen.getByRole("heading", { name: "배송비 정책" })).toBeInTheDocument();
    expect(screen.getByLabelText("기본 배송비")).toHaveValue(3000);
    expect(screen.getByLabelText("무료배송 기준 금액")).toHaveValue(50000);
    expect(screen.getByRole("button", { name: "정책 저장" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});
```

- [ ] **Step 5: Run component test to verify it fails**

Run:

```powershell
corepack pnpm vitest run "src/app/admin/shipping-policy/_components/ShippingPolicyContent.test.tsx"
```

Expected: FAIL because `ShippingPolicyContent.tsx` does not exist.

- [ ] **Step 6: Implement admin page and content**

Create `src/app/admin/shipping-policy/_components/ShippingPolicyContent.tsx`:

```tsx
"use client";

import type { ShippingPolicyResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useActionState, useState } from "react";
import { updateShippingPolicyAction } from "../actions";

interface ShippingPolicyContentProps {
  policy: ShippingPolicyResponse;
}

export default function ShippingPolicyContent({ policy }: ShippingPolicyContentProps) {
  const [enabled, setEnabled] = useState(policy.enabled ?? false);
  const [state, formAction, isPending] = useActionState(updateShippingPolicyAction, {
    success: false,
    values: {
      enabled: policy.enabled ?? false,
      baseShippingFee: String(policy.baseShippingFee ?? 0),
      freeShippingThreshold: String(policy.freeShippingThreshold ?? 0),
    },
  });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="typo-bold-24 text-gray-900">배송비 정책</h1>
        <p className="mt-2 text-sm text-gray-600">일반상품 장바구니 배송비와 무료배송 기준을 관리합니다.</p>
      </div>

      <form action={formAction} className="rounded-xl border border-gray-200 bg-white p-6">
        <input type="hidden" name="enabled" value={enabled ? "on" : ""} />
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <p className="font-semibold text-gray-900">배송비 정책 사용</p>
            <p className="mt-1 text-sm text-gray-500">꺼져 있으면 백엔드 정책에 따라 배송비 계산이 비활성화됩니다.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="baseShippingFee">
              기본 배송비
            </label>
            <Input
              id="baseShippingFee"
              name="baseShippingFee"
              type="number"
              min={0}
              defaultValue={state.values?.baseShippingFee ?? String(policy.baseShippingFee ?? 0)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="freeShippingThreshold">
              무료배송 기준 금액
            </label>
            <Input
              id="freeShippingThreshold"
              name="freeShippingThreshold"
              type="number"
              min={0}
              defaultValue={state.values?.freeShippingThreshold ?? String(policy.freeShippingThreshold ?? 0)}
            />
          </div>
        </div>

        {state.error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">배송비 정책을 저장했습니다.</p>}

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "저장 중" : "정책 저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

Create `src/app/admin/shipping-policy/page.tsx`:

```tsx
import { get as getAdminShippingPolicy } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import ShippingPolicyContent from "./_components/ShippingPolicyContent";

export default async function AdminShippingPolicyPage() {
  const token = await getAuthToken();
  const response = await getAdminShippingPolicy(token ? withToken(token) : undefined);

  return <ShippingPolicyContent policy={response.data} />;
}
```

- [ ] **Step 7: Add sidebar link**

Modify `src/app/admin/_components/AdminSidebar.tsx` by importing `Truck` from `lucide-react` and adding this item to the `general-items` group:

```tsx
{
  id: "shipping-policy",
  label: "배송비 정책",
  icon: Truck,
  href: "/admin/shipping-policy",
},
```

- [ ] **Step 8: Run tests to verify they pass**

Run:

```powershell
corepack pnpm vitest run "src/app/admin/shipping-policy/actions.test.ts" "src/app/admin/shipping-policy/_components/ShippingPolicyContent.test.tsx"
```

Expected: PASS.

- [ ] **Step 9: Commit**

Run:

```powershell
git add "src/app/admin/shipping-policy" "src/app/admin/_components/AdminSidebar.tsx"
git commit -m "관리자 배송비 정책 화면 추가"
```

---

### Task 10: Full Verification

**Files:**
- Read: all changed files

- [ ] **Step 1: Run all tests**

Run:

```powershell
corepack pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run:

```powershell
corepack pnpm lint
```

Expected: no ESLint errors.

- [ ] **Step 3: Run production build**

Run:

```powershell
corepack pnpm build
```

Expected: build succeeds. If environment variables are missing, record the exact missing variable and run `corepack pnpm lint` plus `corepack pnpm test:run` as the verified minimum.

- [ ] **Step 4: Inspect git diff**

Run:

```powershell
git status --short
git diff --stat HEAD
```

Expected: only cart, cart order, admin shipping policy, generated API, and planned test files changed.

- [ ] **Step 5: Final commit if verification required fixes**

If verification required fixes after the previous task commits, run:

```powershell
git add src docs package.json package-lock.json pnpm-lock.yaml
git commit -m "장바구니 배송비 검증 수정"
```

Expected: working tree is clean except intentionally ignored local files.

---

## Self-Review

- Spec coverage: user cart, guest cart token, cart quote, cart order, Toss, bank transfer, admin shipping policy, existing direct order preservation, tests, and verification are covered by Tasks 1-10.
- Placeholder scan: the plan has concrete paths, commands, function names, and code snippets for every implementation task.
- Type consistency: cart action inputs use `saleAnnouncementId` and `quantity`; cart order action inputs omit `saleAnnouncementId` and `requestedQuantity`; Toss confirm maps redirect `orderId` to backend `pgOrderId`.
