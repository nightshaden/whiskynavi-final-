"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { AdminUserResponse, OrderResponse } from "@/apis/apis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ORDER_STATUS_LABEL: Record<string, string> = {
  ORDER_REQUESTED: "주문 요청",
  PAYMENT_PENDING: "결제 대기",
  ORDER_PREPARING: "준비 중",
  SHIPPING: "배송 중",
  DELIVERY_COMPLETED: "배송 완료",
  RECEIPT_PENDING: "수령 대기",
  RECEIPT_COMPLETED: "수령 완료",
  ORDER_CANCELED: "주문 취소",
  REFUND_REQUESTED: "환불 요청",
  REFUND_COMPLETED: "환불 완료",
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  ORDER_REQUESTED: "bg-blue-100 text-blue-700",
  PAYMENT_PENDING: "bg-yellow-100 text-yellow-700",
  ORDER_PREPARING: "bg-indigo-100 text-indigo-700",
  SHIPPING: "bg-orange-100 text-orange-700",
  DELIVERY_COMPLETED: "bg-green-100 text-green-700",
  RECEIPT_PENDING: "bg-amber-100 text-amber-700",
  RECEIPT_COMPLETED: "bg-green-100 text-green-700",
  ORDER_CANCELED: "bg-gray-200 text-gray-700",
  REFUND_REQUESTED: "bg-red-100 text-red-700",
  REFUND_COMPLETED: "bg-red-100 text-red-700",
};

interface OrderHistoryModalProps {
  isOpen: boolean;
  close: () => void;
  user: AdminUserResponse;
  orders: OrderResponse[];
  totalAmount: number;
}

export default function OrderHistoryModal({
  isOpen,
  close,
  user,
  orders,
  totalAmount,
}: OrderHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.itemName?.toLowerCase().includes(q) ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.orderStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">주문 내역</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {user.name} ({user.username}) - 총 {orders.length}건 / 총 금액{" "}
            {totalAmount.toLocaleString()}원
          </p>
        </DialogHeader>

        <div className="border-t border-gray-200 pt-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="상품명, 주문번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredOrders.length > 0 ? (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">
                          {order.itemName}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            ORDER_STATUS_COLOR[order.orderStatus] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ORDER_STATUS_LABEL[order.orderStatus] ??
                            order.orderStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <p className="text-gray-600">
                          주문번호:{" "}
                          <span className="text-gray-900 font-medium">
                            {order.orderNumber}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          주문일:{" "}
                          <span className="text-gray-900 font-medium">
                            {new Date(order.createdAt)
                              .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                              .replace(/\. /g, ".")
                              .replace(/\.$/, "")}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          신청:{" "}
                          <span className="text-gray-900 font-bold">
                            {order.requestedQuantity}병
                          </span>
                        </p>
                        {order.approvedQuantity != null && (
                          <p className="text-gray-600">
                            배정:{" "}
                            <span className="text-amber-700 font-bold">
                              {order.approvedQuantity}병
                            </span>
                          </p>
                        )}
                        <p className="text-gray-600">
                          단가:{" "}
                          <span className="text-gray-900 font-medium">
                            {order.unitPrice.toLocaleString()}원
                          </span>
                        </p>
                        <p className="text-gray-600">
                          총 금액:{" "}
                          <span className="text-gray-900 font-bold">
                            {order.totalPrice.toLocaleString()}원
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "주문 내역이 없습니다."}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={close}
          >
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
