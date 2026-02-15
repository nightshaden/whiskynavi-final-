import { notFound } from "next/navigation";
import { type BottleAdminResponse, getApiAdminBottlesId } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import ProductEditContent from "./_components/ProductEditContent";

interface ProductEditPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps) {
  const { productId } = await params;
  const token = await getAuthToken();

  let product: BottleAdminResponse | undefined;
  try {
    const res = await getApiAdminBottlesId(Number(productId), withToken(token));
    product = res.data;
  } catch {
    notFound();
  }

  return <ProductEditContent product={product} />;
}
