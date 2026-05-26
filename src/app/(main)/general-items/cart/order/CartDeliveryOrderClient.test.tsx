import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CartDeliveryOrderClient from "./CartDeliveryOrderClient";

vi.mock("./actions", () => ({
  createGeneralItemCartTossTicket: vi.fn(),
}));

describe("CartDeliveryOrderClient", () => {
  it("renders cart delivery order title, total price, and available payment buttons", () => {
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
    expect(screen.queryByRole("button", { name: "토스 결제" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결제" })).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "결제" })).not.toBeInTheDocument();
  });
});
