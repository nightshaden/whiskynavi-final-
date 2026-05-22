"use client";

import type { OrderTicketResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition, type ChangeEvent } from "react";
import OrderCompletionPanel from "./_components/OrderCompletionPanel";
import {
  createGeneralItemBankTransferOrder,
  createGeneralItemTossTicket,
  type GeneralItemDeliveryOrderInput,
} from "./actions";

const TOSS_SCRIPT_SRC = "https://js.tosspayments.com/v2/standard";

type TossPaymentInstance = {
  requestPayment: (params: {
    method: "CARD";
    amount: { currency: "KRW"; value: number };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
    customerName?: string;
    customerMobilePhone?: string;
  }) => Promise<void>;
};

type TossPaymentsFactory = ((clientKey: string) => {
  payment: (params: { customerKey: string }) => TossPaymentInstance;
}) & {
  ANONYMOUS: string;
};

declare global {
  interface Window {
    TossPayments?: TossPaymentsFactory;
  }
}

let tossScriptPromise: Promise<TossPaymentsFactory> | null = null;

interface GeneralItemDeliveryOrderClientProps {
  initialSaleAnnouncementId?: number;
  initialQuantity?: number;
  itemName?: string;
  unitPrice?: number;
}

function createAttemptKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTossPaymentsScript(): Promise<TossPaymentsFactory> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("브라우저에서만 토스 결제를 시작할 수 있습니다."));
  }

  if (window.TossPayments) {
    return Promise.resolve(window.TossPayments);
  }

  if (tossScriptPromise) return tossScriptPromise;

  tossScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TOSS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) {
        resolve(window.TossPayments);
      } else {
        reject(new Error("토스 결제 SDK를 불러오지 못했습니다."));
      }
    };
    script.onerror = () => reject(new Error("토스 결제 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  return tossScriptPromise;
}

function formatCurrency(amount?: number) {
  if (amount == null) return "-";
  return `${amount.toLocaleString("ko-KR")}원`;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

async function requestTossPayment(ticket: OrderTicketResponse, input: GeneralItemDeliveryOrderInput) {
  if (!ticket.clientKey || !ticket.pgOrderId || !ticket.amount || !ticket.successUrl || !ticket.failUrl) {
    throw new Error("토스 결제 티켓 정보가 올바르지 않습니다. 다시 시도해 주세요.");
  }

  const tossPayments = await loadTossPaymentsScript();
  const payment = tossPayments(ticket.clientKey).payment({
    customerKey: tossPayments.ANONYMOUS,
  });

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: ticket.amount,
    },
    orderId: ticket.pgOrderId,
    orderName: ticket.orderName ?? "WhiskyNavi 상품",
    successUrl: ticket.successUrl,
    failUrl: ticket.failUrl,
    customerEmail: input.guestEmail,
    customerName: input.receiverName,
    customerMobilePhone: normalizePhone(input.receiverPhone),
  });
}

export default function GeneralItemDeliveryOrderClient({
  initialSaleAnnouncementId,
  initialQuantity = 1,
  itemName,
  unitPrice,
}: GeneralItemDeliveryOrderClientProps) {
  const [isPending, startTransition] = useTransition();
  const [attemptKey, setAttemptKey] = useState("");
  const [pendingMethod, setPendingMethod] = useState<"BANK_TRANSFER" | "TOSS" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] =
    useState<Awaited<ReturnType<typeof createGeneralItemBankTransferOrder>>["data"]>(undefined);
  const [form, setForm] = useState({
    saleAnnouncementId: initialSaleAnnouncementId ? String(initialSaleAnnouncementId) : "",
    requestedQuantity: String(initialQuantity),
    receiverName: "",
    receiverPhone: "",
    deliveryAddress: "",
    deliveryMemo: "",
    orderNote: "",
    guestEmail: "",
  });

  const ensureAttemptKey = () => {
    if (attemptKey) return attemptKey;
    const nextKey = createAttemptKey();
    setAttemptKey(nextKey);
    return nextKey;
  };

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const buildInput = (): GeneralItemDeliveryOrderInput => ({
    saleAnnouncementId: Number(form.saleAnnouncementId),
    requestedQuantity: Number(form.requestedQuantity),
    receiverName: form.receiverName,
    receiverPhone: form.receiverPhone,
    deliveryAddress: form.deliveryAddress,
    deliveryMemo: form.deliveryMemo,
    orderNote: form.orderNote,
    guestEmail: form.guestEmail,
  });

  const resetAttempt = () => {
    setAttemptKey(createAttemptKey());
    setCompletedOrder(undefined);
    setError(null);
    setPendingMethod(null);
  };

  const handleBankTransfer = () => {
    const input = buildInput();
    const idempotencyKey = ensureAttemptKey();
    setError(null);
    setPendingMethod("BANK_TRANSFER");

    startTransition(async () => {
      const result = await createGeneralItemBankTransferOrder(input, idempotencyKey);

      if (result.success) {
        setCompletedOrder(result.data);
      } else {
        setError(result.error ?? "계좌이체 주문 생성에 실패했습니다.");
      }

      setPendingMethod(null);
    });
  };

  const handleTossPayment = () => {
    const input = buildInput();
    const idempotencyKey = ensureAttemptKey();
    setError(null);
    setPendingMethod("TOSS");

    startTransition(async () => {
      const result = await createGeneralItemTossTicket(input, idempotencyKey);

      if (!result.success) {
        setError(result.error ?? "토스 결제 준비에 실패했습니다.");
        setPendingMethod(null);
        return;
      }

      try {
        await requestTossPayment(result.data?.ticket ?? {}, input);
      } catch (paymentError) {
        setError(paymentError instanceof Error ? paymentError.message : "토스 결제를 시작하지 못했습니다.");
        setPendingMethod(null);
      }
    });
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <OrderCompletionPanel result={completedOrder} />
        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={resetAttempt} className="text-gray-300 hover:text-white">
            새 주문 작성
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_360px] md:py-16">
      <form className="border border-white/10 bg-white/5 p-5 md:p-8" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-8">
          <p className="text-sm text-amber-300">GENERAL / ITEM 배송 주문</p>
          <h1 className="typo-bold-24 mt-2 text-white md:text-3xl">일반 아이템 배송 주문서</h1>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="saleAnnouncementId">
              판매 공고 ID
            </label>
            <Input
              id="saleAnnouncementId"
              inputMode="numeric"
              value={form.saleAnnouncementId}
              onChange={updateField("saleAnnouncementId")}
              placeholder="1001"
              className="border-white/15 bg-black/20 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="requestedQuantity">
              주문 수량
            </label>
            <Input
              id="requestedQuantity"
              inputMode="numeric"
              min={1}
              value={form.requestedQuantity}
              onChange={updateField("requestedQuantity")}
              className="border-white/15 bg-black/20 text-white"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="receiverName">
                수령인
              </label>
              <Input
                id="receiverName"
                value={form.receiverName}
                onChange={updateField("receiverName")}
                placeholder="홍길동"
                className="border-white/15 bg-black/20 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="receiverPhone">
                수령인 연락처
              </label>
              <Input
                id="receiverPhone"
                value={form.receiverPhone}
                onChange={updateField("receiverPhone")}
                placeholder="010-1234-5678"
                className="border-white/15 bg-black/20 text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="guestEmail">
              주문 안내 이메일
            </label>
            <Input
              id="guestEmail"
              type="email"
              value={form.guestEmail}
              onChange={updateField("guestEmail")}
              placeholder="guest@example.com"
              className="border-white/15 bg-black/20 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="deliveryAddress">
              배송 주소
            </label>
            <Textarea
              id="deliveryAddress"
              value={form.deliveryAddress}
              onChange={updateField("deliveryAddress")}
              placeholder="서울특별시 ..."
              className="min-h-24 border-white/15 bg-black/20 text-white"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="deliveryMemo">
                배송 메모
              </label>
              <Textarea
                id="deliveryMemo"
                value={form.deliveryMemo}
                onChange={updateField("deliveryMemo")}
                placeholder="문 앞에 놓아주세요"
                className="min-h-24 border-white/15 bg-black/20 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="orderNote">
                주문 메모
              </label>
              <Textarea
                id="orderNote"
                value={form.orderNote}
                onChange={updateField("orderNote")}
                placeholder="선물용입니다"
                className="min-h-24 border-white/15 bg-black/20 text-white"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-5 border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={handleBankTransfer}
            disabled={isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {pendingMethod === "BANK_TRANSFER" ? "주문 생성 중" : "계좌이체 주문"}
          </Button>
          <Button type="button" variant="outline" onClick={handleTossPayment} disabled={isPending}>
            {pendingMethod === "TOSS" ? "결제 준비 중" : "토스 결제"}
          </Button>
        </div>
      </form>

      <aside className="h-fit border border-white/10 bg-black/20 p-5">
        <h2 className="typo-bold-18 text-white">주문 요약</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400">상품명</dt>
            <dd className="text-right text-white">{itemName || "일반 아이템"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400">단가</dt>
            <dd className="text-white">{formatCurrency(unitPrice)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400">수량</dt>
            <dd className="text-white">{Number(form.requestedQuantity) || 0}개</dd>
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-200">예상 금액</dt>
              <dd className="font-bold text-white">
                {unitPrice ? formatCurrency(unitPrice * (Number(form.requestedQuantity) || 0)) : "서버 계산"}
              </dd>
            </div>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-5 text-gray-400">
          최종 금액과 주문 권한은 서버 검증 결과를 기준으로 확정됩니다. 같은 주문 시도에서는 멱등키가 유지되어 중복
          주문을 줄입니다.
        </p>
      </aside>
    </div>
  );
}
