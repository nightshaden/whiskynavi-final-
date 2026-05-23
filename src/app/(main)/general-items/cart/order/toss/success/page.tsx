import TossSuccessClient from "./TossSuccessClient";

interface TossSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    paymentKey?: string;
    amount?: string;
  }>;
}

export default async function TossSuccessPage({ searchParams }: TossSuccessPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#1d2429] text-white">
      <TossSuccessClient orderId={params.orderId} paymentKey={params.paymentKey} amount={params.amount} />
    </main>
  );
}
