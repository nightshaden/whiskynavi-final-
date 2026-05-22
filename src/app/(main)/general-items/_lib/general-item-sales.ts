import type { GetApiSalesParams, PageSaleAnnouncementResponse, SaleAnnouncementResponse } from "@/apis/generated/api";

type FetchSalesPage = (params: GetApiSalesParams) => Promise<{ data: PageSaleAnnouncementResponse }>;

interface FetchOpenGeneralItemSalesPageOptions {
  fetchSales: FetchSalesPage;
  page: number;
  size: number;
  sourcePageSize?: number;
}

export function isOpenGeneralItemSale(sale: SaleAnnouncementResponse) {
  return sale.productType === "ITEM" && sale.saleType === "GENERAL" && sale.saleStatus === "OPEN";
}

export function collectGeneralItemProductIds(sales: Pick<SaleAnnouncementResponse, "productId">[]) {
  return Array.from(new Set(sales.map((sale) => sale.productId).filter((id): id is number => id != null)));
}

export async function fetchOpenGeneralItemSalesPage({
  fetchSales,
  page,
  size,
  sourcePageSize = 100,
}: FetchOpenGeneralItemSalesPageOptions) {
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageSize = Number.isFinite(size) && size > 0 ? size : 20;
  const sales: SaleAnnouncementResponse[] = [];
  let sourcePage = 0;
  let totalPages = 1;

  do {
    const response = await fetchSales({
      page: sourcePage,
      size: sourcePageSize,
      sort: ["createdAt,desc"],
      saleStatus: "OPEN",
    });
    const data = response.data;

    sales.push(...(data.content ?? []).filter(isOpenGeneralItemSale));
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

export function buildGeneralItemSaleDetailHref(sale: Pick<SaleAnnouncementResponse, "id">) {
  return sale.id != null ? `/general-items/${sale.id}` : "/general-items";
}

export function getGeneralItemOrderQuantityLimit(
  sale: Pick<SaleAnnouncementResponse, "availableQuantity" | "maxOrderQuantity">,
) {
  const availableQuantity = sale.availableQuantity != null && sale.availableQuantity > 0 ? sale.availableQuantity : 0;
  const maxOrderQuantity =
    sale.maxOrderQuantity != null && sale.maxOrderQuantity > 0 ? sale.maxOrderQuantity : undefined;

  return maxOrderQuantity == null ? availableQuantity : Math.min(availableQuantity, maxOrderQuantity);
}

export function normalizeGeneralItemOrderQuantity(value: number, limit: number) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;
  const safeValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;

  return Math.min(Math.max(safeValue, 1), safeLimit);
}
