"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import Pagination from "../../_components/Pagination";
import { generateProducts } from "../../_data/mockData";

interface ProductsContentProps {
  searchParams: {
    page?: string;
    limit?: string;
    q?: string;
    brand?: string;
    distillery?: string;
    sortBy?: string;
    order?: string;
  };
}

export default function ProductsContent({
  searchParams,
}: ProductsContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  // searchParams에서 상태 읽기
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = Number(searchParams.limit) || 20;
  const searchQuery = searchParams.q || "";
  const brandFilter = searchParams.brand || "all";
  const distilleryFilter = searchParams.distillery || "all";
  const sortBy =
    (searchParams.sortBy as
      | "createdAt"
      | "bottledDate"
      | "distillationDate"
      | "abv"
      | "capacity") || "createdAt";
  const sortOrder = (searchParams.order as "asc" | "desc") || "desc";

  // 필터 드롭다운 상태
  const [showBrandFilter, setShowBrandFilter] = useState(false);
  const [showDistilleryFilter, setShowDistilleryFilter] = useState(false);

  const products = useMemo(() => generateProducts(), []);

  // 브랜드 및 증류소 목록 추출
  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))],
    [products],
  );
  const distilleries = useMemo(
    () => [...new Set(products.map((p) => p.distillery))],
    [products],
  );

  // 필터링 및 정렬
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.distillery.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower);
      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;
      const matchesDistillery =
        distilleryFilter === "all" || product.distillery === distilleryFilter;

      return matchesSearch && matchesBrand && matchesDistillery;
    });

    result.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case "createdAt":
          compareValue =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "bottledDate":
          compareValue =
            new Date(a.bottledDate).getTime() -
            new Date(b.bottledDate).getTime();
          break;
        case "distillationDate":
          compareValue =
            new Date(a.distillationDate).getTime() -
            new Date(b.distillationDate).getTime();
          break;
        case "abv":
          compareValue = a.abv - b.abv;
          break;
        case "capacity":
          compareValue = a.capacity - b.capacity;
          break;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [products, searchQuery, brandFilter, distilleryFilter, sortBy, sortOrder]);

  // 페이지네이션
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

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
              <thead className="bg-gray-50 border-b border-gray-200">
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
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative whitespace-nowrap">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className="flex items-center gap-1 hover:text-amber-600"
                    >
                      브랜드
                      <Filter size={12} />
                    </button>
                    {showBrandFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-40">
                        <button
                          onClick={() => {
                            updateFilter("brand", "all");
                            setShowBrandFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        {brands.map((brand) => (
                          <button
                            key={brand}
                            onClick={() => {
                              updateFilter("brand", brand);
                              setShowBrandFilter(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === brand ? "bg-amber-50 text-amber-700" : ""}`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative whitespace-nowrap">
                    <button
                      onClick={() =>
                        setShowDistilleryFilter(!showDistilleryFilter)
                      }
                      className="flex items-center gap-1 hover:text-amber-600"
                    >
                      증류소
                      <Filter size={12} />
                    </button>
                    {showDistilleryFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-40 max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            updateFilter("distillery", "all");
                            setShowDistilleryFilter(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${distilleryFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                        >
                          전체
                        </button>
                        {distilleries.map((distillery) => (
                          <button
                            key={distillery}
                            onClick={() => {
                              updateFilter("distillery", distillery);
                              setShowDistilleryFilter(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${distilleryFilter === distillery ? "bg-amber-50 text-amber-700" : ""}`}
                          >
                            {distillery}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
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
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-2 py-1.5 text-xs text-gray-900 whitespace-nowrap">
                      {product.id}
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">
                      <img
                        src={
                          product.imgUrl ||
                          "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100"
                        }
                        alt={product.name}
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
                        onClick={() => handleProductClick(product.id)}
                        className="text-amber-600 hover:text-amber-700 font-medium"
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
            totalItems={filteredProducts.length}
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
