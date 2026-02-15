import {
  getApiAdminBottles,
  getApiAdminBottlesParameters,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import ProductsContent from "./_components/ProductsContent";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
    distillery?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();

  const [bottlesRes, bottleParamsRes] = await Promise.all([
    getApiAdminBottles(
      {
        filters: {
          pageNumber: params.page ? Number(params.page) - 1 : 0,
          pageSize: params.limit ? Number(params.limit) : 20,
          name: params.q || undefined,
          brand: params.brand || undefined,
          distillery: params.distillery || undefined,
        },
      },
      withToken(token),
    ),
    getApiAdminBottlesParameters(withToken(token)),
  ]);

  return (
    <ProductsContent
      searchParams={params}
      products={bottlesRes.data.content ?? []}
      totalElements={bottlesRes.data.totalElements ?? 0}
      brands={bottleParamsRes.data.brands ?? []}
      distilleries={bottleParamsRes.data.distilleries ?? []}
    />
  );
}
