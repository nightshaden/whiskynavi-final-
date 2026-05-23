import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShippingPolicyContent from "./ShippingPolicyContent";

const toggle = vi.fn();

vi.mock("@/app/admin/_components/AdminLayoutClient", () => ({
  useSidebar: () => ({ toggle }),
}));

vi.mock("../actions", () => ({
  updateShippingPolicyAction: vi.fn(),
}));

describe("ShippingPolicyContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial policy and lets switch toggle off", async () => {
    const user = userEvent.setup();

    render(
      <ShippingPolicyContent
        policy={{
          enabled: true,
          baseShippingFee: 3000,
          freeShippingThreshold: 50000,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "배송비 정책" })).toBeInTheDocument();
    expect(screen.getByLabelText("기본 배송비")).toHaveValue(3000);
    expect(screen.getByLabelText("무료배송 기준 금액")).toHaveValue(50000);
    expect(screen.getByRole("button", { name: "정책 저장" })).toBeInTheDocument();

    const switchControl = screen.getByRole("switch", { name: "정책 사용" });
    expect(switchControl).toBeChecked();

    await user.click(switchControl);

    expect(switchControl).not.toBeChecked();
  });
});
