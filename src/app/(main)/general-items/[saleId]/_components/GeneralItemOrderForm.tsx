"use client";

import { useState } from "react";
import { normalizeGeneralItemOrderQuantity } from "../../_lib/general-item-sales";

interface GeneralItemOrderFormProps {
  saleAnnouncementId: number;
  itemName: string;
  unitPrice?: number;
  quantityLimit: number;
}

export default function GeneralItemOrderForm({
  saleAnnouncementId,
  itemName,
  unitPrice,
  quantityLimit,
}: GeneralItemOrderFormProps) {
  const [quantity, setQuantity] = useState(1);

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(normalizeGeneralItemOrderQuantity(nextQuantity, quantityLimit));
  };

  return (
    <form action="/general-items/delivery-order" method="get" className="grid gap-4">
      <input type="hidden" name="saleAnnouncementId" value={saleAnnouncementId} />
      <input type="hidden" name="itemName" value={itemName} />
      <input type="hidden" name="unitPrice" value={unitPrice ?? ""} />

      <div>
        <div className="flex w-full items-center justify-between gap-4">
          <label className="shrink-0 text-sm font-medium text-gray-200" htmlFor="quantity">
            수량
          </label>
          <div className="flex w-fit items-center border border-white/15 bg-black/20">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              className="h-7 w-10 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:text-gray-600"
              disabled={quantity <= 1}
              aria-label="수량 감소"
            >
              -
            </button>
            <input
              id="quantity"
              name="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={quantityLimit}
              value={quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              required
              className="h-7 w-14 border-x border-white/15 bg-transparent px-2 text-center text-white outline-none focus:bg-white/5"
            />
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              className="h-7 w-10 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:text-gray-600"
              disabled={quantity >= quantityLimit}
              aria-label="수량 증가"
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-2 text-right text-xs text-gray-400">
          최대 {quantityLimit.toLocaleString("ko-KR")}개까지 선택할 수 있습니다.
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700"
      >
        주문하기
      </button>
    </form>
  );
}
