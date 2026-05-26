import { redirect } from "next/navigation";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.orderId) query.set("orderId", params.orderId);
  if (params.paymentKey) query.set("paymentKey", params.paymentKey);
  if (params.amount) query.set("amount", params.amount);

  redirect(`/general-items/cart/order/toss/success${query.size ? `?${query.toString()}` : ""}`);
}
