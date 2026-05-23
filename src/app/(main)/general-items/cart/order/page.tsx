import {
  getApiUsersMe,
  getApiUsersMeDeliveryAddresses,
  type DeliveryAddressResponse,
  type UserSelfResponse,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canCheckoutCart } from "../_lib/cart-utils";
import { fetchCartQuote } from "../actions";
import CartDeliveryOrderClient from "./CartDeliveryOrderClient";

export default async function GeneralItemCartDeliveryOrderPage() {
  const quoteResult = await fetchCartQuote();

  const quote = quoteResult.data;

  if (!quoteResult.success || !quote || !canCheckoutCart(quote)) {
    redirect("/general-items/cart");
  }

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
      <CartDeliveryOrderClient quote={quote} currentUser={currentUser} deliveryAddresses={deliveryAddresses} />
    </main>
  );
}
