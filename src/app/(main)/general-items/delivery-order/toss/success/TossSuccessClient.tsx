"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import OrderCompletionPanel from "../../_components/OrderCompletionPanel";
import { confirmGeneralItemTossPayment } from "../../actions";

interface TossSuccessClientProps {
  orderId?: string;
  paymentKey?: string;
  amount?: string;
}

type ConfirmResult = Awaited<ReturnType<typeof confirmGeneralItemTossPayment>>;

export default function TossSuccessClient({ orderId, paymentKey, amount }: TossSuccessClientProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ConfirmResult | null>(null);

  const confirm = () => {
    startTransition(async () => {
      setResult(await confirmGeneralItemTossPayment({ orderId, paymentKey, amount }));
    });
  };

  useEffect(() => {
    confirm();
    // Toss redirect params are fixed for this page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      {isPending && (
        <div className="border border-white/10 bg-white/5 p-8 text-center text-white">결제를 확정하는 중입니다.</div>
      )}

      {!isPending && result?.success && result.data && <OrderCompletionPanel result={result.data} />}

      {!isPending && result && !result.success && (
        <div className="border border-red-400/30 bg-red-400/10 p-6">
          <h1 className="typo-bold-24 text-white">결제 확정에 실패했습니다.</h1>
          <p className="mt-3 text-sm text-red-100">{result.error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={confirm} className="bg-amber-600 hover:bg-amber-700">
              같은 결제 정보로 다시 확정
            </Button>
            <Button asChild variant="outline">
              <Link href="/general-items/delivery-order">새 주문 작성</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
