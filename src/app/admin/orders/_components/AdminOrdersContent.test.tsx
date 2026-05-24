import type { OrderResponse } from "@/apis/generated/api";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminOrdersContent from "./AdminOrdersContent";

const push = vi.fn();
const refresh = vi.fn();
const toggle = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/app/admin/_components/AdminLayoutClient", () => ({
  useSidebar: () => ({ toggle }),
}));

vi.mock("../actions", () => ({
  completeAdminOrderDelivery: vi.fn(),
  confirmAdminBankTransfer: vi.fn(),
  exportAdminDeliveryCsv: vi.fn(),
  shipAdminOrderDelivery: vi.fn(),
  updateAdminOrderDelivery: vi.fn(),
  updateAdminOrderStatus: vi.fn(),
  uploadAdminDeliveryCsv: vi.fn(),
}));

describe("AdminOrdersContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders cart order summary with item count, quantity, and shipping price breakdown", () => {
    render(
      <AdminOrdersContent
        searchParams={{}}
        totalElements={1}
        orders={[
          {
            id: 1,
            orderNumber: "ODR-CART-1",
            createdAt: "2026-05-24T10:00:00+09:00",
            customer: { name: "김관리", phone: "01012345678", guest: false },
            delivery: { carrierName: "CJ대한통운", address: "서울시 강남구" },
            orderSource: "CART",
            orderStatus: "PAYMENT_PENDING",
            itemsSummary: "시음권 세트 외 2건",
            itemsCount: 3,
            totalQuantity: 4,
            items: [
              { orderItemId: 10, itemName: "시음권 세트", quantity: 1, unitPrice: 1000, lineTotalPrice: 1000 },
              { orderItemId: 11, itemName: "테이스팅 글라스", quantity: 3, unitPrice: 2000, lineTotalPrice: 6000 },
            ],
            priceSummary: {
              itemsTotalPrice: 7000,
              shippingFee: 3000,
              totalPrice: 10000,
              freeShippingApplied: false,
            },
            payment: { paymentMethod: "BANK_TRANSFER", paymentStatus: "DEPOSIT_WAITING" },
            availableAdminActions: [],
          } satisfies OrderResponse,
        ]}
      />,
    );

    expect(screen.getByText("장바구니")).toBeInTheDocument();
    expect(screen.getByText("시음권 세트 외 2건")).toBeInTheDocument();
    expect(screen.getByText("총 수량 4개")).toBeInTheDocument();
    expect(screen.getByText("시음권 세트 · 1개 · 1,000원")).toBeInTheDocument();
    expect(screen.getByText("테이스팅 글라스 · 3개 · 6,000원")).toBeInTheDocument();
    expect(screen.getByText("상품 7,000원")).toBeInTheDocument();
    expect(screen.getByText("배송비 3,000원")).toBeInTheDocument();
    expect(screen.getByText("총 10,000원")).toBeInTheDocument();
  });
});
