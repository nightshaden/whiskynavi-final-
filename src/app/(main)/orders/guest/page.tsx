import GuestOrderLookupClient from "./GuestOrderLookupClient";

interface GuestOrderPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    guestOrderToken?: string;
  }>;
}

export default async function GuestOrderPage({ searchParams }: GuestOrderPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#1d2429] text-white">
      <GuestOrderLookupClient initialOrderNumber={params.orderNumber} initialGuestOrderToken={params.guestOrderToken} />
    </main>
  );
}
