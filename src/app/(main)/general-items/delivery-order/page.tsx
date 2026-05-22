import GeneralItemDeliveryOrderClient from "./GeneralItemDeliveryOrderClient";

interface GeneralItemDeliveryOrderPageProps {
  searchParams: Promise<{
    saleAnnouncementId?: string;
    quantity?: string;
    itemName?: string;
    unitPrice?: string;
  }>;
}

function toPositiveNumber(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function GeneralItemDeliveryOrderPage({ searchParams }: GeneralItemDeliveryOrderPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#1d2429] pt-16 text-white lg:pt-20">
      <GeneralItemDeliveryOrderClient
        initialSaleAnnouncementId={toPositiveNumber(params.saleAnnouncementId)}
        initialQuantity={toPositiveNumber(params.quantity)}
        itemName={params.itemName}
        unitPrice={toPositiveNumber(params.unitPrice)}
      />
    </main>
  );
}
