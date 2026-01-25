"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
}

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("page", String(page))}`);
    });
  };

  const handleItemsPerPageChange = (value: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", String(value));
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">페이지당:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-600 ml-4">
          {totalItems}개 중 {startIndex}-{endIndex}
        </span>
        {isPending && (
          <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              disabled={isPending}
              className={`w-8 h-8 rounded text-sm font-medium ${
                currentPage === pageNum
                  ? "bg-amber-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              } disabled:opacity-50`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
