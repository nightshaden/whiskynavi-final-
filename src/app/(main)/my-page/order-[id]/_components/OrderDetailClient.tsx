"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { OrderResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { overlay } from "overlay-kit";
import { getOrderStatusConfig, formatCurrency, formatDate } from "../../_lib/utils";
import { CANCELABLE_STATUSES } from "../../_lib/constants";
import OrderCancelModal from "../../_components/OrderCancelModal";

interface OrderDetailClientProps {
  order: OrderResponse;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const status = getOrderStatusConfig(order.orderStatus);
  const canCancel = CANCELABLE_STATUSES.includes(order.orderStatus as never);

  const handleCancelClick = () => {
    overlay.open(({ isOpen, close }) => (
      <OrderCancelModal
        isOpen={isOpen}
        close={close}
        orderId={order.id!}
        itemName={order.itemName || order.saleTitle}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-[#1d2429] pt-10 pb-12 sm:pt-24">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
        {/* Back Button & Header */}
        <div className="mb-3 sm:mb-6">
          <Link
            href="/my-page?tab=orders"
            className="group mb-2 flex items-center gap-2 text-white/70 transition-colors hover:text-white sm:mb-4"
          >
            <ArrowLeft
              size={20}
              className="transition-transform group-hover:-translate-x-1"
            />
            <span className="font-semibold">돌아가기</span>
          </Link>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
            주문 상세
          </h1>
          <p className="text-sm text-gray-400 sm:text-base">
            주문번호: {order.orderNumber}
          </p>
        </div>

        {/* Order Status */}
        <div
          className={`mb-4 border p-4 sm:mb-6 sm:p-6 ${status.colorClass}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-xl font-bold sm:text-2xl">
                {status.label}
              </p>
              <p className="text-sm text-white/60">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {canCancel && (
              <Button variant="destructive" onClick={handleCancelClick}>
                주문 취소
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.8fr_1fr] lg:gap-12">
            {/* 상품 정보 */}
            <div>
              <h3 className="mb-4 border-b border-white/20 pb-3 text-lg font-bold text-white sm:mb-6 sm:pb-4 sm:text-xl lg:text-2xl">
                상품 정보
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <InfoRow label="상품명" value={order.itemName || order.saleTitle || "상품명 없음"} />
                <InfoRow label="신청 수량" value={`${order.requestedQuantity ?? 0}병`} />
                <InfoRow label="배정 수량" value={`${order.approvedQuantity ?? 0}병`} />
                <InfoRow label="단가" value={formatCurrency(order.unitPrice)} />
                <InfoRow
                  label="총 금액"
                  value={formatCurrency(order.totalPrice)}
                  bold
                />
              </div>
            </div>

            {/* 주문 정보 */}
            <div>
              <h3 className="mb-4 border-b border-white/20 pb-3 text-lg font-bold text-white sm:mb-6 sm:pb-4 sm:text-xl lg:text-2xl">
                주문 정보
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <InfoRow label="주문일시" value={formatDate(order.createdAt)} />
                <InfoRow label="주문 유형" value={order.orderType ?? "-"} />
                {order.orderNote && (
                  <InfoRow label="주문 메모" value={order.orderNote} />
                )}
                {order.cancelReason && (
                  <InfoRow label="취소 사유" value={order.cancelReason} />
                )}
                {order.refundReason && (
                  <InfoRow label="환불 사유" value={order.refundReason} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3">
      <span className="text-xs text-gray-400 sm:text-sm lg:text-base">
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm lg:text-base ${bold ? "font-bold" : "font-medium"} text-white`}
      >
        {value}
      </span>
    </div>
  );
}
