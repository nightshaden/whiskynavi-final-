import { getApiAdminOrders, type GetApiAdminOrdersParams } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import AdminOrdersContent, { type AdminOrdersSearchParams } from "../orders/_components/AdminOrdersContent";

interface AdminGeneralItemOrdersPageProps {
  searchParams: Promise<AdminOrdersSearchParams>;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseSize(value?: string) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : 20;
}

function emptyToUndefined(value?: string) {
  return value?.trim() || undefined;
}

export default async function AdminGeneralItemOrdersPage({ searchParams }: AdminGeneralItemOrdersPageProps) {
  const params = await searchParams;
  const token = await getAuthToken();
  const page = parsePage(params.page);
  const size = parseSize(params.limit);

  const query: GetApiAdminOrdersParams = {
    page: page - 1,
    size,
    sort: ["createdAt,desc"],
    orderType: "GENERAL",
    productType: "ITEM",
    orderStatus: emptyToUndefined(params.orderStatus) as GetApiAdminOrdersParams["orderStatus"],
    paymentMethod: emptyToUndefined(params.paymentMethod),
    paymentStatus: emptyToUndefined(params.paymentStatus),
    keyword: emptyToUndefined(params.keyword),
    guestOnly: params.guestOnly === "true" ? true : undefined,
    depositOverdue: params.depositOverdue === "true" ? true : undefined,
  };

  const response = await getApiAdminOrders(query, withToken(token));

  return (
    <AdminOrdersContent
      title="일반상품주문관리"
      basePath="/admin/general-item-orders"
      enableGeneralItemActions
      searchParams={{
        ...params,
        page: String(page),
        limit: String(size),
        orderType: "GENERAL",
        productType: "ITEM",
      }}
      orders={response.data.content ?? []}
      totalElements={response.data.totalElements ?? 0}
    />
  );
}
