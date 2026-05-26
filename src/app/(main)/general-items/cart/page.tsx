import CartContent from "./_components/CartContent";
import { fetchCartQuote } from "./actions";

export default async function GeneralItemCartPage() {
  const result = await fetchCartQuote();

  return (
    <main className="min-h-screen bg-[#1d2429] pt-16 text-white lg:pt-20">
      <CartContent quote={result.data} error={result.success ? undefined : result.error} />
    </main>
  );
}
