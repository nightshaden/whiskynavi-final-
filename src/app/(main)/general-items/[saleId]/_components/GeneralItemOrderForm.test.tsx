import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { addGeneralItemToCart } from "../../cart/actions";
import GeneralItemOrderForm from "./GeneralItemOrderForm";

vi.mock("../../cart/actions", () => ({
  addGeneralItemToCart: vi.fn(),
}));

const mockedAddGeneralItemToCart = vi.mocked(addGeneralItemToCart);

describe("GeneralItemOrderForm", () => {
  it("adds the selected quantity to cart while preserving direct order submit", async () => {
    const user = userEvent.setup();
    mockedAddGeneralItemToCart.mockResolvedValue({ success: true });

    const { container } = render(
      <GeneralItemOrderForm saleAnnouncementId={1001} itemName="테스트 상품" unitPrice={12000} quantityLimit={5} />,
    );

    const form = container.querySelector("form");
    expect(form).toHaveAttribute("action", "/general-items/delivery-order");
    expect(form).toHaveAttribute("method", "get");
    expect(container.querySelector('input[name="saleAnnouncementId"]')).toHaveValue("1001");
    expect(container.querySelector('input[name="itemName"]')).toHaveValue("테스트 상품");
    expect(container.querySelector('input[name="unitPrice"]')).toHaveValue("12000");

    await user.click(screen.getByRole("button", { name: "수량 증가" }));
    await user.click(screen.getByRole("button", { name: "장바구니 담기" }));

    expect(mockedAddGeneralItemToCart).toHaveBeenCalledWith({ saleAnnouncementId: 1001, quantity: 2 });
    expect(screen.getByText("장바구니에 상품을 담았습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "장바구니 보기" })).toHaveAttribute("href", "/general-items/cart");
    expect(screen.getByRole("button", { name: "바로 주문" })).toHaveAttribute("type", "submit");
  });

  it("shows the action error when adding to cart fails", async () => {
    const user = userEvent.setup();
    mockedAddGeneralItemToCart.mockResolvedValue({ success: false, error: "재고가 부족합니다." });

    render(<GeneralItemOrderForm saleAnnouncementId={1001} itemName="테스트 상품" quantityLimit={5} />);

    await user.click(screen.getByRole("button", { name: "장바구니 담기" }));

    expect(screen.getByText("재고가 부족합니다.")).toBeInTheDocument();
  });
});
