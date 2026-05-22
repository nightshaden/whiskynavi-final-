import { getApiAdminItems } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import GeneralItemSaleCreateContent from "./_components/GeneralItemSaleCreateContent";

interface GeneralItemSaleCreatePageProps {
  searchParams: Promise<{
    productId?: string;
    itemName?: string;
    salePrice?: string;
    totalQuantity?: string;
  }>;
}

export default async function GeneralItemSaleCreatePage({ searchParams }: GeneralItemSaleCreatePageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const itemsRes = await getApiAdminItems({ page: 0, size: 100, sort: ["createdAt,desc"] }, withToken(token));

  return <GeneralItemSaleCreateContent items={itemsRes.data.content ?? []} initialValues={params} />;
}
