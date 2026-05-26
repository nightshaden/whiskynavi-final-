import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addGeneralItemToCart } from "../../cart/actions";
import GeneralItemOrderForm from "./GeneralItemOrderForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../cart/actions", () => ({
  addGeneralItemToCart: vi.fn(),
}));

const mockedAddGeneralItemToCart = vi.mocked(addGeneralItemToCart);

describe("GeneralItemOrderForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds the selected quantity to cart before opening the cart order page", async () => {
    const user = userEvent.setup();
    mockedAddGeneralItemToCart.mockResolvedValue({ success: true });

    const { container } = render(<GeneralItemOrderForm saleAnnouncementId={1001} quantityLimit={5} />);

    expect(container.querySelector("form")).not.toHaveAttribute("action", "/general-items/delivery-order");

    await user.click(screen.getByRole("button", { name: "수량 증가" }));
    await user.click(screen.getByRole("button", { name: "바로 주문" }));

    expect(mockedAddGeneralItemToCart).toHaveBeenCalledWith({ saleAnnouncementId: 1001, quantity: 2 });
    expect(push).toHaveBeenCalledWith("/general-items/cart/order");
  });

  it("shows the action error when adding to cart fails", async () => {
    const user = userEvent.setup();
    mockedAddGeneralItemToCart.mockResolvedValue({ success: false, error: "재고가 부족합니다." });

    render(<GeneralItemOrderForm saleAnnouncementId={1001} quantityLimit={5} />);

    await user.click(screen.getByRole("button", { name: "장바구니 담기" }));

    expect(screen.getByText("재고가 부족합니다.")).toBeInTheDocument();
  });
});
