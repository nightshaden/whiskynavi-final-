import {
  patchApiAdminOrdersOrderidDeliveryComplete,
  patchApiAdminOrdersOrderidDeliveryShip,
  patchApiAdminOrdersOrderidPaymentsBankTransferConfirm,
  patchApiAdminOrdersOrderidStatus,
} from "@/apis/generated/api";
import { getAuthToken } from "@/lib/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeAdminOrderDelivery,
  confirmAdminBankTransfer,
  shipAdminOrderDelivery,
  updateAdminOrderStatus,
} from "./actions";

vi.mock("@/apis/generated/api", () => ({
  patchApiAdminOrdersOrderidDeliveryComplete: vi.fn(),
  patchApiAdminOrdersOrderidDeliveryShip: vi.fn(),
  patchApiAdminOrdersOrderidPaymentsBankTransferConfirm: vi.fn(),
  patchApiAdminOrdersOrderidStatus: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getAuthToken: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockedGetAuthToken = vi.mocked(getAuthToken);
const mockedConfirmBankTransfer = vi.mocked(patchApiAdminOrdersOrderidPaymentsBankTransferConfirm);
const mockedShip = vi.mocked(patchApiAdminOrdersOrderidDeliveryShip);
const mockedComplete = vi.mocked(patchApiAdminOrdersOrderidDeliveryComplete);
const mockedStatus = vi.mocked(patchApiAdminOrdersOrderidStatus);

describe("admin order actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetAuthToken.mockResolvedValue("admin-token");
  });

  it("confirms bank transfer with admin token", async () => {
    mockedConfirmBankTransfer.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

    await expect(confirmAdminBankTransfer(10)).resolves.toEqual({ success: true });
    expect(mockedConfirmBankTransfer).toHaveBeenCalledWith(10, {
      headers: { Authorization: "Bearer admin-token" },
    });
  });

  it("ships delivery with default CJ carrier when carrier is empty", async () => {
    mockedShip.mockResolvedValue({ data: { trackingNumber: "1234567890" }, status: 200, headers: new Headers() });

    await expect(shipAdminOrderDelivery(10, { carrierName: "", trackingNumber: "1234567890" })).resolves.toEqual({
      success: true,
    });
    expect(mockedShip).toHaveBeenCalledWith(
      10,
      { carrierName: "CJ대한통운", trackingNumber: "1234567890" },
      { headers: { Authorization: "Bearer admin-token" } },
    );
  });

  it("completes delivery with optional deliveredAt", async () => {
    mockedComplete.mockResolvedValue({
      data: { deliveredAt: "2026-05-21T14:00:00" },
      status: 200,
      headers: new Headers(),
    });

    await expect(completeAdminOrderDelivery(10, "2026-05-21T14:00:00")).resolves.toEqual({ success: true });
    expect(mockedComplete).toHaveBeenCalledWith(
      10,
      { deliveredAt: "2026-05-21T14:00:00" },
      { headers: { Authorization: "Bearer admin-token" } },
    );
  });

  it("updates refund status with reason", async () => {
    mockedStatus.mockResolvedValue({ data: { orderStatus: "REFUND_COMPLETED" }, status: 200, headers: new Headers() });

    await expect(updateAdminOrderStatus(10, "REFUND_COMPLETED", "환불 완료")).resolves.toEqual({ success: true });
    expect(mockedStatus).toHaveBeenCalledWith(
      10,
      { orderStatus: "REFUND_COMPLETED", reason: "환불 완료" },
      { headers: { Authorization: "Bearer admin-token" } },
    );
  });
});
