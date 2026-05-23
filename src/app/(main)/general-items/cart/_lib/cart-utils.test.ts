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
    expect(normalizeCartQuantity(7, 5.5)).toBe(5);
    expect(normalizeCartQuantity(Number.NaN, 5)).toBe(1);
  });

  it("uses a safe upper bound when max quantity is absent or non-positive", () => {
    expect(normalizeCartQuantity(7)).toBe(7);
    expect(normalizeCartQuantity(7, 0)).toBe(7);
    expect(normalizeCartQuantity(7, -1)).toBe(7);
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
    expect(formatCartCurrency(null)).toBe("-");
  });
});
