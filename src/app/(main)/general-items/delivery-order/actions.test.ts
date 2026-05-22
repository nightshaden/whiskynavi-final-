import { ApiError } from "@/apis/errors";
import {
  getApiOrdersGuest,
  patchApiOrdersGuestOrdernumberCancel,
  postApiOrdersGeneralItemsDeliveryBankTransfer,
  postApiOrdersGeneralItemsDeliveryTossConfirm,
  postApiOrdersGeneralItemsDeliveryTossTickets,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelGuestGeneralItemOrder,
  confirmGeneralItemTossPayment,
  createGeneralItemBankTransferOrder,
  createGeneralItemTossTicket,
  lookupGuestGeneralItemOrder,
} from "./actions";

vi.mock("@/apis/generated/api", () => ({
  getApiOrdersGuest: vi.fn(),
  patchApiOrdersGuestOrdernumberCancel: vi.fn(),
  postApiOrdersGeneralItemsDeliveryBankTransfer: vi.fn(),
  postApiOrdersGeneralItemsDeliveryTossConfirm: vi.fn(),
  postApiOrdersGeneralItemsDeliveryTossTickets: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockedGetAuthToken = vi.mocked(getAuthToken);
const mockedBankTransfer = vi.mocked(postApiOrdersGeneralItemsDeliveryBankTransfer);
const mockedTossTickets = vi.mocked(postApiOrdersGeneralItemsDeliveryTossTickets);
const mockedTossConfirm = vi.mocked(postApiOrdersGeneralItemsDeliveryTossConfirm);
const mockedGuestLookup = vi.mocked(getApiOrdersGuest);
const mockedGuestCancel = vi.mocked(patchApiOrdersGuestOrdernumberCancel);

const validOrderInput = {
  saleAnnouncementId: 1001,
  requestedQuantity: 1,
  receiverName: "홍길동",
  receiverPhone: "010-1234-5678",
  deliveryAddress: "서울특별시 중구",
  deliveryMemo: "문 앞",
  orderNote: "선물용",
  guestEmail: "guest@example.com",
};

describe("general item delivery order actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAuthToken.mockResolvedValue(undefined);
  });

  it("validates required guest email before bank transfer order creation", async () => {
    const result = await createGeneralItemBankTransferOrder({ ...validOrderInput, guestEmail: "" }, "idem-1");

    expect(result).toEqual({
      success: false,
      error: "주문 안내를 받을 이메일을 입력해주세요.",
    });
    expect(mockedBankTransfer).not.toHaveBeenCalled();
  });

  it("creates a bank transfer order with idempotency key and optional auth token", async () => {
    mockedGetAuthToken.mockResolvedValue("access-token");
    mockedBankTransfer.mockResolvedValue({
      data: { order: { id: 10, orderNumber: "ODR-1" } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createGeneralItemBankTransferOrder(validOrderInput, "idem-1");

    expect(result).toEqual({
      success: true,
      data: { order: { id: 10, orderNumber: "ODR-1" } },
    });
    expect(mockedBankTransfer).toHaveBeenCalledWith(validOrderInput, {
      headers: {
        Authorization: "Bearer access-token",
        "Idempotency-Key": "idem-1",
      },
    });
  });

  it("issues a Toss ticket with the same order request body and idempotency key", async () => {
    mockedTossTickets.mockResolvedValue({
      data: { ticket: { pgOrderId: "PG-1", amount: 99000 } },
      status: 200,
      headers: new Headers(),
    });

    const result = await createGeneralItemTossTicket(validOrderInput, "idem-2");

    expect(result).toEqual({
      success: true,
      data: { ticket: { pgOrderId: "PG-1", amount: 99000 } },
    });
    expect(mockedTossTickets).toHaveBeenCalledWith(validOrderInput, {
      headers: {
        "Idempotency-Key": "idem-2",
      },
    });
  });

  it("maps Toss success redirect orderId to pgOrderId for confirm", async () => {
    mockedTossConfirm.mockResolvedValue({
      data: { order: { id: 11, orderNumber: "ODR-2" }, paidAmount: 99000 },
      status: 200,
      headers: new Headers(),
    });

    const result = await confirmGeneralItemTossPayment({
      orderId: "PG-1",
      paymentKey: "payment-key",
      amount: "99000",
    });

    expect(result).toEqual({
      success: true,
      data: { order: { id: 11, orderNumber: "ODR-2" }, paidAmount: 99000 },
    });
    expect(mockedTossConfirm).toHaveBeenCalledWith({
      pgOrderId: "PG-1",
      paymentKey: "payment-key",
      amount: 99000,
    });
  });

  it("looks up a guest order with both order number and guest token", async () => {
    mockedGuestLookup.mockResolvedValue({
      data: { id: 12, orderNumber: "ODR-3" },
      status: 200,
      headers: new Headers(),
    });

    const result = await lookupGuestGeneralItemOrder("ODR-3", "A1B2-C3D4");

    expect(result).toEqual({
      success: true,
      data: { id: 12, orderNumber: "ODR-3" },
    });
    expect(mockedGuestLookup).toHaveBeenCalledWith({
      orderNumber: "ODR-3",
      guestOrderToken: "A1B2-C3D4",
    });
  });

  it("cancels a guest order using the guest token in the request body", async () => {
    mockedGuestCancel.mockResolvedValue({
      data: { id: 12, orderNumber: "ODR-3", orderStatus: "ORDER_CANCELED" },
      status: 200,
      headers: new Headers(),
    });

    const result = await cancelGuestGeneralItemOrder("ODR-3", "A1B2-C3D4", "단순 변심");

    expect(result).toEqual({
      success: true,
      data: { id: 12, orderNumber: "ODR-3", orderStatus: "ORDER_CANCELED" },
    });
    expect(mockedGuestCancel).toHaveBeenCalledWith("ODR-3", {
      guestOrderToken: "A1B2-C3D4",
      reason: "단순 변심",
    });
  });

  it("returns the ticket expired guide message when Toss confirm rejects an expired ticket", async () => {
    mockedTossConfirm.mockRejectedValue(new ApiError(400, '{"message":"주문 티켓이 만료되었습니다."}'));

    const result = await confirmGeneralItemTossPayment({
      orderId: "PG-1",
      paymentKey: "payment-key",
      amount: "99000",
    });

    expect(result).toEqual({
      success: false,
      error: "결제 가능 시간이 만료되었습니다. 주문을 다시 시도해 주세요.",
    });
  });
});
