import {
  type BottleAdminResponse,
  getApiAdminBottlesId,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProductDetailContent from "./_components/ProductDetailContent";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  const token = await getAuthToken();

  let product: BottleAdminResponse | undefined;
  try {
    const res = await getApiAdminBottlesId(Number(productId), withToken(token));
    product = res.data;
  } catch {
    notFound();
  }

  return <ProductDetailContent product={product} />;
}
