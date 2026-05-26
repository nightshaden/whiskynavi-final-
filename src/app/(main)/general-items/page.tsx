import { getApiItemsId, getApiSales, type SaleAnnouncementResponse } from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import Hero from "../_components/Hero";
import Pagination from "../archive/_components/Pagination";
import {
  buildGeneralItemSaleDetailHref,
  collectGeneralItemProductIds,
  fetchOpenGeneralItemSalesPage,
} from "./_lib/general-item-sales";

interface GeneralItemsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseSize(value?: string) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : 20;
}

function formatCurrency(value?: number) {
  if (value == null) return "-";
  return `${value.toLocaleString("ko-KR")}원`;
}

function buildPageUrl(page: number, limit: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return `/general-items?${params.toString()}`;
}

async function fetchSaleImageMap(sales: SaleAnnouncementResponse[]) {
  const productIds = collectGeneralItemProductIds(sales);
  const results = await Promise.allSettled(
    productIds.map(async (productId) => {
      const response = await getApiItemsId(productId);
      return [productId, response.data.imageUrl] as const;
    }),
  );

  return new Map(
    results
      .filter(
        (result): result is PromiseFulfilledResult<readonly [number, string | undefined]> =>
          result.status === "fulfilled",
      )
      .filter((result) => Boolean(result.value[1]))
      .map((result) => [result.value[0], result.value[1] as string]),
  );
}

function GeneralItemSaleCard({ sale, imageUrl }: { sale: SaleAnnouncementResponse; imageUrl?: string }) {
  const remainingQuantity = sale.availableQuantity ?? 0;
  const isSoldOut = remainingQuantity <= 0;
  const itemTitle = sale.title || sale.itemName || "일반상품";

  return (
    <article className="flex h-full flex-col border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/[0.07]">
      <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden bg-black/20">
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={itemTitle}
            width={320}
            height={320}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="px-4 text-center text-sm text-white/45">{itemTitle}</div>
        )}
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="typo-bold-20 line-clamp-2 text-white">{itemTitle}</h2>
        </div>
        <Badge className={`shrink-0 border-transparent text-white ${isSoldOut ? "bg-gray-600" : "bg-green-700"}`}>
          {isSoldOut ? "품절" : "판매중"}
        </Badge>
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <p className="text-xl font-semibold text-white">{formatCurrency(sale.salePrice)}</p>
        <p className="text-sm text-gray-400">
          {remainingQuantity.toLocaleString("ko-KR")} / {(sale.totalQuantity ?? 0).toLocaleString("ko-KR")}개 남음
        </p>
      </div>

      <div className="mt-auto pt-6">
        {isSoldOut ? (
          <span className="block w-full border border-white/10 px-4 py-3 text-center text-sm font-semibold text-gray-500">
            주문 불가
          </span>
        ) : (
          <Link
            href={buildGeneralItemSaleDetailHref(sale)}
            className="block w-full bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700"
          >
            상세보기
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function GeneralItemsPage({ searchParams }: GeneralItemsPageProps) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const size = parseSize(params.limit);
  const result = await fetchOpenGeneralItemSalesPage({
    fetchSales: getApiSales,
    page,
    size,
  });
  const imageMap = await fetchSaleImageMap(result.sales);
  const totalPages = Math.max(1, Math.ceil(result.totalElements / size));

  return (
    <div className="min-h-screen bg-[#1d2429]">
      <Hero
        backgroundText="ITEMS"
        title="일반상품 판매공고"
        subtitle="배송 주문 가능한 일반상품 판매공고를 확인하세요."
      />

      <main className="mx-auto max-w-[1440px] px-4 pt-3 pb-12 lg:px-10 lg:pt-2">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">판매중인 일반상품 {result.totalElements.toLocaleString("ko-KR")}건</p>
          <Link
            href="/orders/guest"
            className="text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            비회원 주문 조회
          </Link>
        </div>

        {result.sales.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-white/5 px-4 py-12 text-center text-sm text-gray-400">
            현재 판매 중인 일반상품 공고가 없습니다.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {result.sales.map((sale) => (
              <GeneralItemSaleCard
                key={sale.id ?? `${sale.productId}-${sale.title}`}
                sale={sale}
                imageUrl={sale.productId != null ? imageMap.get(sale.productId) : undefined}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          buildPageUrl={(nextPage) => buildPageUrl(nextPage, size)}
        />
      </main>
    </div>
  );
}
