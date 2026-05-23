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
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  buildCartHeaders,
  CART_TOKEN_COOKIE,
  getCartTokenCookieOptions,
  getResponseCartToken,
} from "./_lib/cart-token";

const CART_PATH = "/general-items/cart";
const CART_ORDER_PATH = "/general-items/cart/order";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type AddGeneralItemToCartInput = {
  saleAnnouncementId: number;
  quantity: number;
};

const addItemSchema = z.object({
  saleAnnouncementId: z.number().int().positive("판매 공고 정보가 올바르지 않습니다."),
  quantity: z.number().int().positive("수량을 다시 선택해 주세요."),
});

const cartItemIdSchema = z.number().int().positive("장바구니 상품 정보가 올바르지 않습니다.");
const quantitySchema = z.number().int().positive("수량을 다시 선택해 주세요.");

async function buildCartOptions(): Promise<RequestInit | undefined> {
  const [authToken, cookieStore] = await Promise.all([getAuthToken(), cookies()]);
  const cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  const headers = buildCartHeaders({ authToken, cartToken });

  return Object.keys(headers).length > 0 ? { headers } : undefined;
}

function hasCartIdentity(options?: RequestInit): boolean {
  const headers = (options?.headers ?? {}) as Record<string, string>;
  return Boolean(headers.Authorization || headers["X-Cart-Token"]);
}

async function buildIdentifiedCartOptions(): Promise<RequestInit | undefined> {
  const options = await buildCartOptions();
  return hasCartIdentity(options) ? options : undefined;
}

async function persistCartTokenFromResponse(data: unknown): Promise<void> {
  const cartToken = getResponseCartToken(data);
  if (!cartToken) return;

  const cookieStore = await cookies();
  cookieStore.set(CART_TOKEN_COOKIE, cartToken, getCartTokenCookieOptions());
}

function revalidateCartPaths() {
  revalidatePath(CART_PATH);
  revalidatePath(CART_ORDER_PATH);
}

export async function fetchCurrentCart(): Promise<ActionResult<CartResponse>> {
  try {
    const options = await buildIdentifiedCartOptions();
    if (!options) {
      return { success: true, data: { items: [] } };
    }

    const response = await getCurrent(options);
    await persistCartTokenFromResponse(response.data);

    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "장바구니를 불러오지 못했습니다."),
    };
  }
}

export async function fetchCartQuote(): Promise<ActionResult<CartQuoteResponse>> {
  try {
    const options = await buildIdentifiedCartOptions();
    if (!options) {
      return {
        success: true,
        data: { items: [], itemsTotalPrice: 0, shippingFee: 0, totalPrice: 0 },
      };
    }

    const response = await quote(options);

    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "장바구니 견적을 불러오지 못했습니다."),
    };
  }
}

export async function addGeneralItemToCart(input: AddGeneralItemToCartInput): Promise<ActionResult<CartResponse>> {
  try {
    const parsed = addItemSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const response = await addItem(parsed.data, await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    revalidateCartPaths();

    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "장바구니에 상품을 담지 못했습니다."),
    };
  }
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<ActionResult<CartResponse>> {
  try {
    const parsedCartItemId = cartItemIdSchema.safeParse(cartItemId);
    if (!parsedCartItemId.success) {
      return { success: false, error: parsedCartItemId.error.issues[0].message };
    }

    const parsedQuantity = quantitySchema.safeParse(quantity);
    if (!parsedQuantity.success) {
      return { success: false, error: parsedQuantity.error.issues[0].message };
    }

    const response = await updateQuantity(
      parsedCartItemId.data,
      { quantity: parsedQuantity.data },
      await buildCartOptions(),
    );
    await persistCartTokenFromResponse(response.data);
    revalidateCartPaths();

    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "장바구니 수량을 변경하지 못했습니다."),
    };
  }
}

export async function removeCartItem(cartItemId: number): Promise<ActionResult<CartResponse>> {
  try {
    const parsedCartItemId = cartItemIdSchema.safeParse(cartItemId);
    if (!parsedCartItemId.success) {
      return { success: false, error: parsedCartItemId.error.issues[0].message };
    }

    const response = await deleteItem(parsedCartItemId.data, await buildCartOptions());
    await persistCartTokenFromResponse(response.data);
    revalidateCartPaths();

    return { success: true, data: response.data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "장바구니 상품을 삭제하지 못했습니다."),
    };
  }
}
