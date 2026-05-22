import { getApiSales } from "@/apis/generated/api";
import GeneralItemSalesContent from "./_components/GeneralItemSalesContent";
import { fetchGeneralItemSalesPage } from "./_lib/general-item-sales";

const SALE_STATUSES = ["DRAFT", "OPEN", "CLOSED", "SOLD_OUT"] as const;

function toSaleStatus(value?: string) {
  return SALE_STATUSES.find((status) => status === value);
}

interface GeneralItemSalesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    saleStatus?: string;
  }>;
}

export default async function GeneralItemSalesPage({ searchParams }: GeneralItemSalesPageProps) {
  const params = await searchParams;
  const currentPage = params.page ? Number(params.page) : 1;
  const itemsPerPage = params.limit ? Number(params.limit) : 50;

  const result = await fetchGeneralItemSalesPage({
    fetchSales: getApiSales,
    page: currentPage,
    size: itemsPerPage,
    saleStatus: toSaleStatus(params.saleStatus),
  });

  return <GeneralItemSalesContent searchParams={params} sales={result.sales} totalElements={result.totalElements} />;
}
