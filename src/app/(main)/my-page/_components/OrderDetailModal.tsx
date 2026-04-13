"use client";

import type { OrderResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { overlay } from "overlay-kit";
import { CANCELABLE_STATUSES } from "../_lib/constants";
import { formatCurrency, formatDate, getOrderStatusConfig } from "../_lib/utils";
import OrderCancelModal from "./OrderCancelModal";

interface OrderDetailModalProps {
  isOpen: boolean;
  close: () => void;
  order: OrderResponse;
}

export default function OrderDetailModal({ isOpen, close, order }: OrderDetailModalProps) {
  const status = getOrderStatusConfig(order.orderStatus);
  const canCancel = CANCELABLE_STATUSES.includes(order.orderStatus as never);

  const handleCancelClick = () => {
    overlay.open(({ isOpen: cancelOpen, close: cancelClose }) => (
      <OrderCancelModal
        isOpen={cancelOpen}
        close={cancelClose}
        orderId={order.id!}
        itemName={order.itemName || order.saleTitle}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>주문 상세</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* 주문 상태 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">주문번호: {order.orderNumber}</p>
              <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
            <span className={`typo-bold-14 rounded px-3 py-1 ${status.colorClass}`}>{status.label}</span>
          </div>

          {/* 상품 정보 */}
          <div className="border-t pt-4">
            <h4 className="mb-3 font-bold text-gray-900">상품 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">상품명</span>
                <span className="font-medium">{order.itemName || order.saleTitle || "상품명 없음"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">신청 수량</span>
                <span className="font-medium">{order.requestedQuantity}병</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배정 수량</span>
                <span className="font-medium">{order.approvedQuantity}병</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">단가</span>
                <span className="font-medium">{formatCurrency(order.unitPrice)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold text-gray-900">총 금액</span>
                <span className="font-bold text-gray-900">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* 취소 사유 */}
          {order.cancelReason && (
            <div className="border-t pt-4">
              <h4 className="mb-2 font-bold text-gray-900">취소 사유</h4>
              <p className="text-sm text-gray-600">{order.cancelReason}</p>
            </div>
          )}

          {/* 취소 버튼 */}
          {canCancel && (
            <div className="border-t pt-4">
              <Button variant="destructive" onClick={handleCancelClick}>
                주문 취소
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
