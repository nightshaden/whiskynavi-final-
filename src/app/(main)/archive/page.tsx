import { api, type BottleQueries } from "@/apis/apis";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { BottleImage } from "./BottleImage";

type PageProps = {
  searchParams: Promise<BottleQueries>;
};

function buildPageUrl(queries: BottleQueries, pageNumber: number): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(queries)) {
    // pageNumber와 page는 제외 (아래에서 page로 새로 설정)
    if (key === "pageNumber" || key === "page") continue;
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  params.set("page", String(pageNumber));

  return `/archive?${params.toString()}`;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  const showPages = 5;

  if (totalPages <= showPages + 2) {
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(0);

  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages - 2, currentPage + 1);

  if (currentPage <= 2) {
    start = 1;
    end = Math.min(showPages - 2, totalPages - 2);
  } else if (currentPage >= totalPages - 3) {
    start = Math.max(1, totalPages - showPages + 1);
    end = totalPages - 2;
  }

  if (start > 1) {
    pages.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages - 1);

  return pages;
}

const Page = async ({ searchParams }: PageProps) => {
  const queries = await searchParams;
  const bottlesResponse = await api.getBottles(queries);

  const currentPage = bottlesResponse.number;
  const totalPages = bottlesResponse.totalPages;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <main>
      <section className="mx-auto w-full">
        <div className="flex flex-wrap gap-5">
          {bottlesResponse.content.map((bottle) => (
            <Link
              key={bottle.id}
              href={`/archive/${bottle.id}`}
              className="block w-[240px]"
            >
              <BottleImage
                src={bottle.imgUrl ?? "/detail-sample.png"}
                alt={bottle.name}
                containerClassName="w-[240px] h-[240px] border-gray-300 border-solid border"
                imageClassName="h-[240px]"
              />
              <p className="typo-medium-18 mt-3 text-center text-white">
                {bottle.name}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="typo-regular-13 text-center text-white">
                  {bottle.brand}
                </p>
                <p className="typo-regular-13 text-center text-white">
                  {bottle.series}
                </p>
                <p className="typo-regular-13 text-center text-white">{`${bottle.abv}% / ${bottle.capacity}ml`}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 페이지네이션 */}

        {totalPages > 1 && (
          <div className="mr-65">
            <Pagination className="mt-20 py-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      currentPage > 0
                        ? buildPageUrl(queries, currentPage - 1)
                        : undefined
                    }
                    aria-disabled={currentPage === 0}
                    className={"text-white hover:bg-white/10"}
                  />
                </PaginationItem>

                {pageNumbers.map((page, idx) => {
                  const key =
                    page === "ellipsis"
                      ? `ellipsis-before-${pageNumbers[idx + 1]}`
                      : page;
                  return page === "ellipsis" ? (
                    <PaginationItem key={key}>
                      <PaginationEllipsis className="text-white/50" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={key}>
                      <PaginationLink
                        href={buildPageUrl(queries, page)}
                        isActive={page === currentPage}
                        className={
                          page === currentPage
                            ? "bg-white text-black hover:bg-white/90"
                            : "text-white hover:bg-white/10"
                        }
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href={
                      currentPage < totalPages - 1
                        ? buildPageUrl(queries, currentPage + 1)
                        : undefined
                    }
                    aria-disabled={currentPage >= totalPages - 1}
                    className={
                      currentPage >= totalPages - 1
                        ? "pointer-events-none opacity-50"
                        : "text-white hover:bg-white/10"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </main>
  );
};

export default Page;
