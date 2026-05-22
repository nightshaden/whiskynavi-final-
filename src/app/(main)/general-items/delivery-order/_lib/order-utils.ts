import type { OrderDeliveryResponse } from "@/apis/generated/api";
import { OrderResponseOrderStatus } from "@/apis/generated/api";

const GENERAL_ITEM_CANCELABLE_STATUSES = new Set<string>([
  OrderResponseOrderStatus.PAYMENT_PENDING,
  OrderResponseOrderStatus.ORDER_PREPARING,
]);

const STATUS_CONFIG_MAP: Record<string, { label: string; colorClass: string }> = {
  [OrderResponseOrderStatus.ORDER_REQUESTED]: {
    label: "주문 접수",
    colorClass: "border-yellow-600/30 bg-yellow-600/20 text-yellow-400",
  },
  [OrderResponseOrderStatus.PAYMENT_PENDING]: {
    label: "입금 대기",
    colorClass: "border-orange-600/30 bg-orange-600/20 text-orange-400",
  },
  [OrderResponseOrderStatus.ORDER_PREPARING]: {
    label: "상품 준비 중",
    colorClass: "border-blue-600/30 bg-blue-600/20 text-blue-400",
  },
  [OrderResponseOrderStatus.PAYMENT_COMPLETED]: {
    label: "결제 완료",
    colorClass: "border-blue-600/30 bg-blue-600/20 text-blue-400",
  },
  [OrderResponseOrderStatus.SHIPPING]: {
    label: "배송 중",
    colorClass: "border-sky-600/30 bg-sky-600/20 text-sky-400",
  },
  [OrderResponseOrderStatus.DELIVERY_COMPLETED]: {
    label: "배송 완료",
    colorClass: "border-green-600/30 bg-green-600/20 text-green-400",
  },
  [OrderResponseOrderStatus.RECEIPT_PENDING]: {
    label: "수령 대기",
    colorClass: "border-purple-600/30 bg-purple-600/20 text-purple-400",
  },
  [OrderResponseOrderStatus.RECEIPT_COMPLETED]: {
    label: "수령 완료",
    colorClass: "border-green-600/30 bg-green-600/20 text-green-400",
  },
  [OrderResponseOrderStatus.ORDER_CANCELED]: {
    label: "주문 취소",
    colorClass: "border-red-600/30 bg-red-600/20 text-red-400",
  },
  [OrderResponseOrderStatus.REFUND_REQUESTED]: {
    label: "환불 요청",
    colorClass: "border-red-600/30 bg-red-600/20 text-red-400",
  },
  [OrderResponseOrderStatus.REFUND_REJECTED]: {
    label: "환불 거절",
    colorClass: "border-amber-600/30 bg-amber-600/20 text-amber-400",
  },
  [OrderResponseOrderStatus.REFUND_COMPLETED]: {
    label: "환불 완료",
    colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
  },
};

export function getGeneralItemOrderStatusConfig(status?: string): { label: string; colorClass: string } {
  if (!status) {
    return {
      label: "알 수 없음",
      colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
    };
  }

  return (
    STATUS_CONFIG_MAP[status] ?? {
      label: status,
      colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
    }
  );
}

export function canRequestDeliveryOrderCancel(status?: string): boolean {
  return status ? GENERAL_ITEM_CANCELABLE_STATUSES.has(status) : false;
}

export function getDeliveryProgressLabel(status?: string, delivery?: OrderDeliveryResponse): string {
  if (status === OrderResponseOrderStatus.DELIVERY_COMPLETED || delivery?.deliveredAt) {
    return "배송 완료";
  }

  if (delivery?.trackingNumber || status === OrderResponseOrderStatus.SHIPPING) {
    return "배송 중";
  }

  return "배송 준비 중";
}
