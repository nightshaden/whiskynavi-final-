import { type BottleAdminResponse, getApiAdminBottlesId, getApiAdminBottlesParameters } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProductEditContent from "./_components/ProductEditContent";

interface ProductEditPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductEditPage({ params }: ProductEditPageProps) {
  const { productId } = await params;
  const token = await getAuthToken();

  let product: BottleAdminResponse | undefined;
  try {
    const res = await getApiAdminBottlesId(Number(productId), withToken(token));
    product = res.data;
  } catch {
    notFound();
  }

  const parameterValuesRes = await getApiAdminBottlesParameters(withToken(token));

  return <ProductEditContent product={product} parameterValues={parameterValuesRes.data} />;
}
