import type { GetApiSalesParams, PageSaleAnnouncementResponse, SaleAnnouncementResponse } from "@/apis/generated/api";

type FetchSalesPage = (params: GetApiSalesParams) => Promise<{ data: PageSaleAnnouncementResponse }>;

interface FetchGeneralItemSalesPageOptions {
  fetchSales: FetchSalesPage;
  page: number;
  size: number;
  saleStatus?: GetApiSalesParams["saleStatus"];
  sourcePageSize?: number;
}

export function isGeneralItemSale(sale: SaleAnnouncementResponse) {
  return sale.productType === "ITEM" && sale.saleType === "GENERAL";
}

export async function fetchGeneralItemSalesPage({
  fetchSales,
  page,
  size,
  saleStatus,
  sourcePageSize = 100,
}: FetchGeneralItemSalesPageOptions) {
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageSize = Number.isFinite(size) && size > 0 ? size : 50;
  const sales: SaleAnnouncementResponse[] = [];
  let sourcePage = 0;
  let totalPages = 1;

  do {
    const response = await fetchSales({
      page: sourcePage,
      size: sourcePageSize,
      sort: ["createdAt,desc"],
      saleStatus,
    });
    const data = response.data;

    sales.push(...(data.content ?? []).filter(isGeneralItemSale));
    totalPages = data.totalPages ?? totalPages;

    if (data.last) break;
    sourcePage += 1;
  } while (sourcePage < totalPages);

  const start = (currentPage - 1) * pageSize;

  return {
    sales: sales.slice(start, start + pageSize),
    totalElements: sales.length,
  };
}
