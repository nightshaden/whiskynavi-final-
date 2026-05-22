"use client";

import type { DeliveryAddressResponse, OrderTicketResponse, UserSelfResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import OrderCompletionPanel from "./_components/OrderCompletionPanel";
import {
  createDeliveryAddress,
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
  currentUser?: UserSelfResponse | null;
  deliveryAddresses?: DeliveryAddressResponse[];
}

type AddressFormState = {
  addressName: string;
  receiverName: string;
  receiverPhone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo: string;
  defaultAddress: boolean;
};

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

function createAddressFormState(user?: UserSelfResponse | null): AddressFormState {
  return {
    addressName: "",
    receiverName: user?.name ?? "",
    receiverPhone: user?.phone ?? "",
    postalCode: "",
    address: "",
    addressDetail: "",
    deliveryMemo: "",
    defaultAddress: true,
  };
}

function formatDeliveryAddress(address: DeliveryAddressResponse) {
  const streetAddress = [address.address, address.addressDetail].filter(Boolean).join(" ");
  return [address.postalCode ? `(${address.postalCode})` : "", streetAddress].filter(Boolean).join(" ");
}

function getDefaultAddress(addresses: DeliveryAddressResponse[]) {
  return addresses.find((address) => address.defaultAddress) ?? null;
}

function RequiredMark() {
  return (
    <span className="ml-1 text-amber-300" aria-label="필수">
      *
    </span>
  );
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
  currentUser,
  deliveryAddresses = [],
}: GeneralItemDeliveryOrderClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddressPending, startAddressTransition] = useTransition();
  const [attemptKey, setAttemptKey] = useState("");
  const [pendingMethod, setPendingMethod] = useState<"BANK_TRANSFER" | "TOSS" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSameAsOrderer, setIsSameAsOrderer] = useState(false);
  const [addresses, setAddresses] = useState(deliveryAddresses);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormState>(() => createAddressFormState(currentUser));
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
  const saleAnnouncementName = itemName || "선택된 판매공고";
  const hasOrdererInfo = Boolean(currentUser);
  const hasAddresses = addresses.length > 0;

  const ensureAttemptKey = () => {
    if (attemptKey) return attemptKey;
    const nextKey = createAttemptKey();
    setAttemptKey(nextKey);
    return nextKey;
  };

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateAddressField =
    (field: keyof AddressFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "defaultAddress" && event.target instanceof HTMLInputElement
          ? event.target.checked
          : event.target.value;
      setAddressForm((current) => ({ ...current, [field]: value }));
    };

  const applyAddress = (address: DeliveryAddressResponse) => {
    setForm((current) => ({
      ...current,
      receiverName: address.receiverName || current.receiverName,
      receiverPhone: address.receiverPhone || current.receiverPhone,
      deliveryAddress: formatDeliveryAddress(address) || current.deliveryAddress,
      deliveryMemo: address.deliveryMemo ?? current.deliveryMemo,
    }));
  };

  const applyOrdererInfo = (address?: DeliveryAddressResponse | null) => {
    setForm((current) => ({
      ...current,
      receiverName: currentUser?.name || current.receiverName,
      receiverPhone: currentUser?.phone || current.receiverPhone,
      guestEmail: currentUser?.email || current.guestEmail,
      ...(address
        ? {
            deliveryAddress: formatDeliveryAddress(address) || current.deliveryAddress,
            deliveryMemo: address.deliveryMemo ?? current.deliveryMemo,
          }
        : {}),
    }));
  };

  const handleSameAsOrdererChange = (checked: boolean | "indeterminate") => {
    const nextChecked = checked === true;
    setIsSameAsOrderer(nextChecked);

    if (!nextChecked || !currentUser) return;

    const defaultAddress = getDefaultAddress(addresses);
    applyOrdererInfo(defaultAddress);

    if (!defaultAddress) {
      setAddressForm(createAddressFormState(currentUser));
      setAddressError(null);
      setIsAddressDialogOpen(true);
    }
  };

  const handleAddressSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const addressId = Number(event.target.value);
    const selectedAddress = addresses.find((address) => address.id === addressId);
    if (selectedAddress) applyAddress(selectedAddress);
  };

  const handleAddressDialogOpenChange = (open: boolean) => {
    setIsAddressDialogOpen(open);
    if (open) {
      setAddressError(null);
      setAddressForm(createAddressFormState(currentUser));
    }
  };

  const handleCreateAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressError(null);

    startAddressTransition(async () => {
      const result = await createDeliveryAddress(addressForm);

      if (!result.success || !result.data) {
        setAddressError(result.error ?? "배송지 저장에 실패했습니다.");
        return;
      }

      setAddresses((current) => {
        const next = result.data?.defaultAddress
          ? current.map((address) => ({ ...address, defaultAddress: false }))
          : current;
        return [...next, result.data!];
      });
      applyAddress(result.data);
      setIsAddressDialogOpen(false);
      setAddressForm(createAddressFormState(currentUser));
    });
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
    <>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_360px] md:py-16">
        <form className="border border-white/10 bg-white/5 p-5 md:p-8" onSubmit={(event) => event.preventDefault()}>
          <div className="mb-8">
            <p className="text-sm text-amber-300">GENERAL / ITEM 배송 주문</p>
            <h1 className="typo-bold-24 mt-2 text-white md:text-3xl">일반 아이템 배송 주문서</h1>
          </div>

          <div className="grid gap-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-200">판매공고명</p>
              <div className="min-h-10 border border-white/15 bg-black/20 px-3 py-2 text-sm text-white">
                {saleAnnouncementName}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="requestedQuantity">
                주문 수량
                <RequiredMark />
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

            <div className="flex items-center gap-2 border border-white/10 bg-black/10 p-3">
              <Checkbox
                id="sameAsOrderer"
                checked={isSameAsOrderer}
                onCheckedChange={handleSameAsOrdererChange}
                disabled={!hasOrdererInfo}
                className="border-white/40 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-600"
              />
              <label htmlFor="sameAsOrderer" className="text-sm font-medium text-gray-200">
                주문자와 같음
              </label>
              {!hasOrdererInfo && <span className="text-xs text-gray-500">로그인 후 사용할 수 있습니다.</span>}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="receiverName">
                  수령인
                  <RequiredMark />
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
                  <RequiredMark />
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
                <RequiredMark />
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
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-gray-200" htmlFor="deliveryAddress">
                  배송 주소
                  <RequiredMark />
                </label>
                {hasOrdererInfo && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddressDialogOpenChange(true)}
                    className="border-white/20 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    주소 추가
                  </Button>
                )}
              </div>
              {hasOrdererInfo && (
                <div className="mb-3">
                  <select
                    aria-label="배송지 주소록"
                    defaultValue=""
                    onChange={handleAddressSelect}
                    className="h-10 w-full border border-white/15 bg-black/20 px-3 text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="" className="bg-[#1d2429] text-gray-300">
                      주소록에서 선택
                    </option>
                    {addresses.map((address) => (
                      <option
                        key={address.id ?? `${address.addressName}-${address.address}`}
                        value={address.id}
                        className="bg-[#1d2429]"
                      >
                        {address.defaultAddress ? "[기본] " : ""}
                        {address.addressName || formatDeliveryAddress(address)}
                      </option>
                    ))}
                  </select>
                  {!hasAddresses && (
                    <p className="mt-2 text-xs text-amber-200">
                      등록된 배송지가 없습니다. 주소 추가로 기본 배송지를 등록해 주세요.
                    </p>
                  )}
                </div>
              )}
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

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Button
              type="button"
              onClick={handleBankTransfer}
              disabled={isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {pendingMethod === "BANK_TRANSFER" ? "주문 생성 중" : "계좌이체 주문"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTossPayment}
              disabled={isPending}
              className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              {pendingMethod === "TOSS" ? "결제 준비 중" : "토스 결제"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Link href="/general-items">취소</Link>
            </Button>
          </div>
        </form>

        <aside className="h-fit border border-white/10 bg-black/20 p-5">
          <h2 className="typo-bold-18 text-white">주문 요약</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">판매공고명</dt>
              <dd className="text-right text-white">{saleAnnouncementName}</dd>
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

      <Dialog open={isAddressDialogOpen} onOpenChange={handleAddressDialogOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>배송지 추가</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleCreateAddress}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="addressName">
                  배송지 이름
                  <RequiredMark />
                </label>
                <Input
                  id="addressName"
                  value={addressForm.addressName}
                  onChange={updateAddressField("addressName")}
                  placeholder="집"
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <Checkbox
                  id="defaultAddress"
                  checked={addressForm.defaultAddress}
                  onCheckedChange={(checked) =>
                    setAddressForm((current) => ({ ...current, defaultAddress: checked === true }))
                  }
                />
                <label htmlFor="defaultAddress" className="text-sm text-gray-700">
                  기본 배송지로 설정
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="addressReceiverName">
                  수령인
                  <RequiredMark />
                </label>
                <Input
                  id="addressReceiverName"
                  value={addressForm.receiverName}
                  onChange={updateAddressField("receiverName")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="addressReceiverPhone">
                  수령인 연락처
                  <RequiredMark />
                </label>
                <Input
                  id="addressReceiverPhone"
                  value={addressForm.receiverPhone}
                  onChange={updateAddressField("receiverPhone")}
                  placeholder="010-1234-5678"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[160px_1fr]">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="postalCode">
                  우편번호
                </label>
                <Input
                  id="postalCode"
                  value={addressForm.postalCode}
                  onChange={updateAddressField("postalCode")}
                  placeholder="04524"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="address">
                  기본 주소
                  <RequiredMark />
                </label>
                <Input
                  id="address"
                  value={addressForm.address}
                  onChange={updateAddressField("address")}
                  placeholder="서울특별시 중구 ..."
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="addressDetail">
                상세 주소
              </label>
              <Input
                id="addressDetail"
                value={addressForm.addressDetail}
                onChange={updateAddressField("addressDetail")}
                placeholder="101호"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="addressDeliveryMemo">
                배송 메모
              </label>
              <Textarea
                id="addressDeliveryMemo"
                value={addressForm.deliveryMemo}
                onChange={updateAddressField("deliveryMemo")}
                placeholder="문 앞에 놓아주세요"
              />
            </div>

            {addressError && <p className="text-sm text-red-600">{addressError}</p>}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                닫기
              </Button>
              <Button type="submit" disabled={isAddressPending}>
                {isAddressPending ? "저장 중" : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
