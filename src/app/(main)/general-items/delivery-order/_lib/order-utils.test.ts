import { describe, expect, it } from "vitest";
import {
  canRequestDeliveryOrderCancel,
  getDeliveryProgressLabel,
  getGeneralItemOrderStatusConfig,
} from "./order-utils";

describe("general item delivery order utils", () => {
  it("allows cancel request only before shipping or terminal refund/cancel states", () => {
    expect(canRequestDeliveryOrderCancel("PAYMENT_PENDING")).toBe(true);
    expect(canRequestDeliveryOrderCancel("ORDER_PREPARING")).toBe(true);

    expect(canRequestDeliveryOrderCancel("SHIPPING")).toBe(false);
    expect(canRequestDeliveryOrderCancel("DELIVERY_COMPLETED")).toBe(false);
    expect(canRequestDeliveryOrderCancel("REFUND_REQUESTED")).toBe(false);
    expect(canRequestDeliveryOrderCancel("REFUND_COMPLETED")).toBe(false);
    expect(canRequestDeliveryOrderCancel("ORDER_CANCELED")).toBe(false);
  });

  it("derives delivery progress from order status and delivery timestamps", () => {
    expect(getDeliveryProgressLabel("ORDER_PREPARING", {})).toBe("배송 준비 중");
    expect(
      getDeliveryProgressLabel("SHIPPING", {
        carrierName: "CJ대한통운",
        trackingNumber: "1234567890",
        shippedAt: "2026-05-20T10:00:00",
      }),
    ).toBe("배송 중");
    expect(getDeliveryProgressLabel("DELIVERY_COMPLETED", { trackingNumber: "1234567890" })).toBe("배송 완료");
    expect(getDeliveryProgressLabel("SHIPPING", { deliveredAt: "2026-05-21T14:00:00" })).toBe("배송 완료");
  });

  it("maps refund rejected status for display", () => {
    expect(getGeneralItemOrderStatusConfig("REFUND_REJECTED")).toMatchObject({
      label: "환불 거절",
    });
  });
});
