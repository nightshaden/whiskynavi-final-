import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGeneralItemCartBankTransferOrder, createGeneralItemCartTossTicket } from "./actions";
import CartDeliveryOrderClient from "./CartDeliveryOrderClient";

vi.mock("./actions", () => ({
  createGeneralItemCartBankTransferOrder: vi.fn(),
  createGeneralItemCartTossTicket: vi.fn(),
}));

describe("CartDeliveryOrderClient", () => {
  beforeEach(() => {
    vi.mocked(createGeneralItemCartBankTransferOrder).mockReset();
    vi.mocked(createGeneralItemCartTossTicket).mockReset();
  });

  it("renders cart delivery order title, total price, and payment buttons", () => {
    render(
      <CartDeliveryOrderClient
        quote={{
          items: [{ cartItemId: 1, itemName: "테스트 상품", quantity: 1, lineTotalPrice: 20000, valid: true }],
          itemsTotalPrice: 20000,
          shippingFee: 3000,
          totalPrice: 23000,
        }}
      />,
    );

    expect(screen.getByText("장바구니 배송 주문서")).toBeInTheDocument();
    expect(screen.getAllByText("20,000원").length).toBeGreaterThan(0);
    expect(screen.getByText("3,000원")).toBeInTheDocument();
    expect(screen.getByText("23,000원")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "계좌이체 주문" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "토스 결제" })).toBeInTheDocument();
  });

  it("submits cart order payload without direct-order sale fields", async () => {
    vi.mocked(createGeneralItemCartBankTransferOrder).mockResolvedValue({
      success: false,
      error: "테스트 종료",
    });

    render(
      <CartDeliveryOrderClient
        quote={{
          items: [{ cartItemId: 1, itemName: "테스트 상품", quantity: 1, lineTotalPrice: 20000, valid: true }],
          itemsTotalPrice: 20000,
          shippingFee: 3000,
          totalPrice: 23000,
        }}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: /^수령인\s*필수$/ }), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByRole("textbox", { name: /^수령인 연락처\s*필수$/ }), {
      target: { value: "010-1234-5678" },
    });
    fireEvent.change(screen.getByLabelText(/주문 안내 이메일/), { target: { value: "guest@example.com" } });
    fireEvent.change(screen.getByLabelText(/배송 주소/), { target: { value: "서울특별시 중구" } });
    fireEvent.change(screen.getByLabelText(/배송 메모/), { target: { value: "문 앞" } });
    fireEvent.change(screen.getByLabelText(/주문 메모/), { target: { value: "선물용" } });

    fireEvent.click(screen.getByRole("button", { name: "계좌이체 주문" }));

    await waitFor(() => {
      expect(createGeneralItemCartBankTransferOrder).toHaveBeenCalled();
    });

    const [payload, idempotencyKey] = vi.mocked(createGeneralItemCartBankTransferOrder).mock.calls[0];
    expect(payload).toEqual({
      receiverName: "홍길동",
      receiverPhone: "010-1234-5678",
      deliveryAddress: "서울특별시 중구",
      deliveryMemo: "문 앞",
      orderNote: "선물용",
      guestEmail: "guest@example.com",
    });
    expect(payload).not.toHaveProperty("saleAnnouncementId");
    expect(payload).not.toHaveProperty("requestedQuantity");
    expect(idempotencyKey).toEqual(expect.any(String));
  });

  it("shows an alert when a cart order action throws unexpectedly", async () => {
    vi.mocked(createGeneralItemCartBankTransferOrder).mockRejectedValue(new Error("network"));

    render(
      <CartDeliveryOrderClient
        quote={{
          items: [{ cartItemId: 1, itemName: "테스트 상품", quantity: 1, lineTotalPrice: 20000, valid: true }],
          itemsTotalPrice: 20000,
          shippingFee: 3000,
          totalPrice: 23000,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "계좌이체 주문" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("계좌이체 주문 생성에 실패했습니다.");
  });

  it("shows an empty-cart prompt instead of payment controls when no cart items are available", () => {
    render(
      <CartDeliveryOrderClient
        quote={{
          items: [],
          itemsTotalPrice: 0,
          shippingFee: 0,
          totalPrice: 0,
        }}
      />,
    );

    expect(screen.getByText("장바구니에 담긴 상품이 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "장바구니로 이동" })).toHaveAttribute("href", "/general-items/cart");
    expect(screen.queryByRole("button", { name: "계좌이체 주문" })).not.toBeInTheDocument();
  });
});
