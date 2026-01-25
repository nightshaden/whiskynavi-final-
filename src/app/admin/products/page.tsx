import ProductsContent from "./_components/ProductsContent";

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
    distillery?: string;
    sortBy?: string;
    order?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  return <ProductsContent searchParams={params} />;
}
