"use client";

import type { OrderResponse, PageOrderResponse } from "@/apis/generated/api";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useRouter, useSearchParams } from "next/navigation";
import { overlay } from "overlay-kit";
import OrderCard from "./OrderCard";
import OrderDetailModal from "./OrderDetailModal";

interface OrdersTabProps {
  orders: PageOrderResponse;
}

export default function OrdersTab({ orders }: OrdersTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const currentPage = orders.number ?? 0;
  const totalPages = orders.totalPages ?? 0;

  const handleOrderClick = (order: OrderResponse) => {
    if (isDesktop) {
      overlay.open(({ isOpen, close }) => (
        <OrderDetailModal isOpen={isOpen} close={close} order={order} />
      ));
    } else {
      router.push(`/my-page/order-${order.id}`);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("tab", "orders");
    router.push(`/my-page?${params.toString()}`);
  };

  return (
    <div>
      <h3 className="typo-bold-20 mb-4 text-white md:mb-6 md:text-2xl">
        주문내역
      </h3>

      {!orders.content?.length ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-400">주문 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:space-y-4">
            {orders.content.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order)}
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={orders.first}
                className="px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-2 text-sm transition-colors ${
                    i === currentPage
                      ? "font-bold text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={orders.last}
                className="px-3 py-2 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
