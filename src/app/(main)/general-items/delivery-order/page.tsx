import {
  getApiUsersMe,
  getApiUsersMeDeliveryAddresses,
  type DeliveryAddressResponse,
  type UserSelfResponse,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
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
  const token = await getAuthToken();
  let currentUser: UserSelfResponse | null = null;
  let deliveryAddresses: DeliveryAddressResponse[] = [];

  if (token) {
    const options = withToken(token);
    const [userResult, addressResult] = await Promise.allSettled([
      getApiUsersMe(options),
      getApiUsersMeDeliveryAddresses(options),
    ]);

    if (userResult.status === "fulfilled") {
      currentUser = userResult.value.data;
    }

    if (addressResult.status === "fulfilled") {
      deliveryAddresses = addressResult.value.data;
    }
  }

  return (
    <main className="min-h-screen bg-[#1d2429] pt-16 text-white lg:pt-20">
      <GeneralItemDeliveryOrderClient
        initialSaleAnnouncementId={toPositiveNumber(params.saleAnnouncementId)}
        initialQuantity={toPositiveNumber(params.quantity)}
        itemName={params.itemName}
        unitPrice={toPositiveNumber(params.unitPrice)}
        currentUser={currentUser}
        deliveryAddresses={deliveryAddresses}
      />
    </main>
  );
}
