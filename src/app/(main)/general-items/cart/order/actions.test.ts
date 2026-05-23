import { ApiError } from "@/apis/errors";
import {
  postApiOrdersGeneralItemsDeliveryCartBankTransfer,
  postApiOrdersGeneralItemsDeliveryCartTossConfirm,
  postApiOrdersGeneralItemsDeliveryCartTossTickets,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CART_TOKEN_COOKIE } from "../_lib/cart-token";
import {
  confirmGeneralItemCartTossPayment,
  createGeneralItemCartBankTransferOrder,
  createGeneralItemCartTossTicket,
} from "./actions";

vi.mock("@/apis/generated/api", () => ({
  postApiOrdersGeneralItemsDeliveryCartBankTransfer: vi.fn(),
  postApiOrdersGeneralItemsDeliveryCartTossConfirm: vi.fn(),
  postApiOrdersGeneralItemsDeliveryCartTossTickets: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ getAuthToken: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockedBankTransfer = vi.mocked(postApiOrdersGeneralItemsDeliveryCartBankTransfer);
const mockedTossTickets = vi.mocked(postApiOrdersGeneralItemsDeliveryCartTossTickets);
const mockedTossConfirm = vi.mocked(postApiOrdersGeneralItemsDeliveryCartTossConfirm);
const mockedGetAuthToken = vi.mocked(getAuthToken);
const mockedCookies = vi.mocked(cookies);
const mockedRevalidatePath = vi.mocked(revalidatePath);

const validCartOrderInput = {
  receiverName: "홍길동",
  receiverPhone: "010-1234-5678",
  deliveryAddress: "서울특별시 중구",
  deliveryMemo: "문 앞",
  orderNote: "선물용",
  guestEmail: "guest@example.com",
};

function createCookieStore(cartToken?: string) {
  return {
    get: vi.fn((name: string) => (name === CART_TOKEN_COOKIE && cartToken ? { name, value: cartToken } : undefined)),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

function mockCookieStore(cartToken?: string): Awaited<ReturnType<typeof cookies>> {
  return createCookieStore(cartToken) as unknown as Awaited<ReturnType<typeof cookies>>;
}

function createRedirectError(): Error & { digest: string } {
  const error = new Error("NEXT_REDIRECT") as Error & { digest: string };
  error.digest = "NEXT_REDIRECT;replace;/sign-in;307;";
  return error;
}

describe("general item cart delivery order actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedGetAuthToken.mockResolvedValue(undefined);
    mockedCookies.mockResolvedValue(mockCookieStore("cart-token"));
  });

  it("validates receiver fields before bank transfer order creation", async () => {
    const result = await createGeneralItemCartBankTransferOrder(
      {
        ...validCartOrderInput,
        receiverName: "",
      },
      "idem-1",
    );

    expect(result).toEqual({
      success: false,
      error: "수령인 이름을 입력해주세요.",
    });
    expect(mockedBankTransfer).not.toHaveBeenCalled();
  });

  it("creates a bank transfer cart order with auth, idempotency, and cart token headers, then clears cart token", async () => {
    const cookieStore = createCookieStore("cart-token");
    mockedCookies.mockResolvedValue(cookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedGetAuthToken.mockResolvedValue("access-token");
    mockedBankTransfer.mockResolvedValue({
      data: { order: { id: 10, orderNumber: "ODR-1" } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createGeneralItemCartBankTransferOrder(validCartOrderInput, "idem-1");

    expect(result).toEqual({
      success: true,
      data: { order: { id: 10, orderNumber: "ODR-1" } },
    });
    expect(mockedBankTransfer).toHaveBeenCalledWith(validCartOrderInput, {
      headers: {
        Authorization: "Bearer access-token",
        "Idempotency-Key": "idem-1",
        "X-Cart-Token": "cart-token",
      },
    });
    expect(cookieStore.delete).toHaveBeenCalledWith({ name: CART_TOKEN_COOKIE, path: "/" });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart/order");
  });

  it("creates a Toss ticket without sale announcement or requested quantity and keeps cart token", async () => {
    const cookieStore = createCookieStore("cart-token");
    mockedCookies.mockResolvedValue(cookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedTossTickets.mockResolvedValue({
      data: { ticket: { pgOrderId: "PG-1", amount: 99000 } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createGeneralItemCartTossTicket(validCartOrderInput, "idem-2");

    expect(result).toEqual({
      success: true,
      data: { ticket: { pgOrderId: "PG-1", amount: 99000 } },
    });
    expect(mockedTossTickets).toHaveBeenCalledWith(validCartOrderInput, {
      headers: {
        "Idempotency-Key": "idem-2",
        "X-Cart-Token": "cart-token",
      },
    });
    expect(cookieStore.delete).not.toHaveBeenCalled();
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart/order");
  });

  it("confirms Toss cart payment and clears cart token", async () => {
    const cookieStore = createCookieStore("cart-token");
    mockedCookies.mockResolvedValue(cookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedTossConfirm.mockResolvedValue({
      data: { order: { id: 11, orderNumber: "ODR-2" }, paidAmount: 99000 },
      status: 200,
      headers: new Headers(),
    });

    const result = await confirmGeneralItemCartTossPayment({
      orderId: "PG-1",
      paymentKey: "payment-key",
      amount: "99000",
    });

    expect(result).toEqual({
      success: true,
      data: { order: { id: 11, orderNumber: "ODR-2" }, paidAmount: 99000 },
    });
    expect(mockedTossConfirm).toHaveBeenCalledWith(
      {
        pgOrderId: "PG-1",
        paymentKey: "payment-key",
        amount: 99000,
      },
      {
        headers: {
          "X-Cart-Token": "cart-token",
        },
      },
    );
    expect(cookieStore.delete).toHaveBeenCalledWith({ name: CART_TOKEN_COOKIE, path: "/" });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/general-items/cart/order");
  });

  it("preserves successful bank transfer response when cart cleanup fails after API success", async () => {
    const cookieStore = createCookieStore("cart-token");
    cookieStore.delete.mockImplementation(() => {
      throw new Error("delete failed");
    });
    mockedCookies.mockResolvedValue(cookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedRevalidatePath.mockImplementation(() => {
      throw new Error("revalidate failed");
    });
    mockedBankTransfer.mockResolvedValue({
      data: { order: { id: 10, orderNumber: "ODR-1" } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createGeneralItemCartBankTransferOrder(validCartOrderInput, "idem-1");

    expect(result).toEqual({
      success: true,
      data: { order: { id: 10, orderNumber: "ODR-1" } },
    });
  });

  it("returns the user-facing API message when cart order creation rejects", async () => {
    mockedBankTransfer.mockRejectedValue(new ApiError(400, '{"message":"장바구니가 비어 있습니다."}'));

    await expect(createGeneralItemCartBankTransferOrder(validCartOrderInput, "idem-1")).resolves.toEqual({
      success: false,
      error: "장바구니가 비어 있습니다.",
    });
  });

  it("returns the ticket expired guide message when Toss confirm rejects an expired ticket", async () => {
    mockedTossConfirm.mockRejectedValue(new ApiError(400, '{"message":"주문 티켓이 만료되었습니다."}'));

    const result = await confirmGeneralItemCartTossPayment({
      orderId: "PG-1",
      paymentKey: "payment-key",
      amount: "99000",
    });

    expect(result).toEqual({
      success: false,
      error: "결제 가능 시간이 만료되었습니다. 주문을 다시 시도해 주세요.",
    });
  });

  it("rethrows redirect errors", async () => {
    const redirectError = createRedirectError();
    mockedTossTickets.mockRejectedValue(redirectError);

    await expect(createGeneralItemCartTossTicket(validCartOrderInput, "idem-2")).rejects.toBe(redirectError);
  });
});
