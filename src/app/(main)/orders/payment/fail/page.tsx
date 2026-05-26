import { redirect } from "next/navigation";

interface PaymentFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function PaymentFailPage({ searchParams }: PaymentFailPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.code) query.set("code", params.code);
  if (params.message) query.set("message", params.message);
  if (params.orderId) query.set("orderId", params.orderId);

  redirect(`/general-items/cart/order/toss/fail${query.size ? `?${query.toString()}` : ""}`);
}
