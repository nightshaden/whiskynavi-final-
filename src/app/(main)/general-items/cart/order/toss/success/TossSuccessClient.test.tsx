import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmGeneralItemCartTossPayment } from "../../actions";
import TossSuccessClient from "./TossSuccessClient";

vi.mock("../../actions", () => ({
  confirmGeneralItemCartTossPayment: vi.fn(),
}));

vi.mock("../../../../delivery-order/_components/OrderCompletionPanel", () => ({
  default: () => <div>주문이 완료되었습니다.</div>,
}));

describe("TossSuccessClient", () => {
  beforeEach(() => {
    vi.mocked(confirmGeneralItemCartTossPayment).mockReset();
  });

  it("confirms the Toss payment only once during StrictMode effect replay", async () => {
    vi.mocked(confirmGeneralItemCartTossPayment).mockResolvedValue({
      success: false,
      error: "확정 실패",
    });

    render(
      <StrictMode>
        <TossSuccessClient orderId="PG-1" paymentKey="payment-key" amount="23000" />
      </StrictMode>,
    );

    await screen.findByRole("alert");

    await waitFor(() => {
      expect(confirmGeneralItemCartTossPayment).toHaveBeenCalledTimes(1);
    });
    expect(confirmGeneralItemCartTossPayment).toHaveBeenCalledWith({
      orderId: "PG-1",
      paymentKey: "payment-key",
      amount: "23000",
    });
  });
});
