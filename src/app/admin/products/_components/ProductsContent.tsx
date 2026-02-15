"use client";

import type { BottleAdminResponse } from "@/apis/generated/api";
import { useRouter } from "next/navigation";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import FilterHeader from "../../_components/FilterHeader";
import Pagination from "../../_components/Pagination";
import { useTableFilter } from "../../_components/useTableFilter";
import Image from "next/image";

interface ProductsContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
    distillery?: string;
  };
  products: BottleAdminResponse[];
  totalElements: number;
  brands: string[];
  distilleries: string[];
}

export default function ProductsContent({
  searchParams,
  products,
  totalElements,
  brands,
  distilleries,
}: ProductsContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";

  const {
    openFilter,
    filterRef,
    toggleFilter,
    closeFilter,
    getFilterValue,
    updateFilter,
  } = useTableFilter({ searchParams, basePath: "/admin/products" });

  const brandOptions = [
    { value: "all", label: "전체" },
    ...brands.map((b) => ({ value: b, label: b })),
  ];

  const distilleryOptions = [
    { value: "all", label: "전체" },
    ...distilleries.map((d) => ({ value: d, label: d })),
  ];

  const handleProductClick = (productId: number) => {
    router.push(`/admin/products/${productId}`);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <>
      <AdminHeader
        title="제품 관리"
        onToggleSidebar={toggle}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      <div className="p-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead ref={filterRef} className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    이미지
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    제품명
                  </th>
                  <FilterHeader
                    label="브랜드"
                    filterKey="brand"
                    options={brandOptions}
                    currentValue={getFilterValue("brand")}
                    isOpen={openFilter === "brand"}
                    onToggle={toggleFilter}
                    onSelect={updateFilter}
                    onClose={closeFilter}
                    dropdownWidth="w-40"
                    className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap"
                  />
                  <FilterHeader
                    label="증류소"
                    filterKey="distillery"
                    options={distilleryOptions}
                    currentValue={getFilterValue("distillery")}
                    isOpen={openFilter === "distillery"}
                    onToggle={toggleFilter}
                    onSelect={updateFilter}
                    onClose={closeFilter}
                    dropdownWidth="w-40 max-h-60 overflow-y-auto"
                    className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap"
                  />
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    시리즈
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    캐스크타입
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    캐스크번호
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    도수
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    용량
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    증류일
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    병입일
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase whitespace-nowrap">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-1.5 text-xs text-gray-900 whitespace-nowrap">
                      {product.id}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <Image
                        width={40}
                        height={40}
                        src={
                          product.imgUrl ||
                          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100"
                        }
                        alt={product.name ?? ""}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100";
                        }}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-900 font-medium max-w-[200px] truncate">
                      {product.name}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.brand}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.distillery}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 truncate max-w-[120px]">
                      {product.series || "-"}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.caskType}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.caskNumber}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.abv}%
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.capacity}ml
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.distillationDate
                        ? new Date(product.distillationDate)
                            .toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                            .replace(/\. /g, ".")
                            .replace(/\.$/, "")
                        : "-"}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600 whitespace-nowrap">
                      {product.bottledDate
                        ? new Date(product.bottledDate)
                            .toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })
                            .replace(/\. /g, ".")
                            .replace(/\.$/, "")
                        : "-"}
                    </td>
                    <td className="px-2 py-1.5 text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleProductClick(product.id!)}
                        className="text-amber-600 hover:text-amber-700 cursor-pointer font-medium"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalItems={totalElements}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchParams={searchParams}
            basePath="/admin/products"
          />
        </div>
      </div>
    </>
  );
}
