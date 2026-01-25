"use client";
import React from "react";
import { Filter } from "lucide-react";

interface AdminProductTableProps {
  paginatedData: any[];
  brandFilter: string;
  showBrandFilter: boolean;
  setShowBrandFilter: (show: boolean) => void;
  setBrandFilter: (brand: string) => void;
  distilleryFilter: string;
  showDistilleryFilter: boolean;
  setShowDistilleryFilter: (show: boolean) => void;
  setDistilleryFilter: (distillery: string) => void;
  availableDistilleries: string[];
  setCurrentPage: (page: number) => void;
  setSelectedProduct: (id: number) => void;
  setProductDetails: (product: any) => void;
  setIsEditMode: (mode: boolean) => void;
}

export const AdminProductTable: React.FC<AdminProductTableProps> = ({
  paginatedData,
  brandFilter,
  showBrandFilter,
  setShowBrandFilter,
  setBrandFilter,
  distilleryFilter,
  showDistilleryFilter,
  setShowDistilleryFilter,
  setDistilleryFilter,
  availableDistilleries,
  setCurrentPage,
  setSelectedProduct,
  setProductDetails,
  setIsEditMode,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
                      setBrandFilter("all");
                      setShowBrandFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => {
                      setBrandFilter("위스키내비");
                      setShowBrandFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "위스키내비" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    위스키내비
                  </button>
                  <button
                    onClick={() => {
                      setBrandFilter("더 위스키테일즈");
                      setShowBrandFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "더 위스키테일즈" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    더 위스키테일즈
                  </button>
                  <button
                    onClick={() => {
                      setBrandFilter("트레일 앤 테일");
                      setShowBrandFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "트레일 앤 테일" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    트레일 앤 테일
                  </button>
                  <button
                    onClick={() => {
                      setBrandFilter("투게더 인 스피릿");
                      setShowBrandFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${brandFilter === "투게더 인 스피릿" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    투게더 인 스피릿
                  </button>
                </div>
              )}
            </th>
            <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase relative whitespace-nowrap">
              <button
                onClick={() => setShowDistilleryFilter(!showDistilleryFilter)}
                className="flex items-center gap-1 hover:text-amber-600"
              >
                증류소
                <Filter size={12} />
              </button>
              {showDistilleryFilter && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 w-40 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setDistilleryFilter("all");
                      setShowDistilleryFilter(false);
                      setCurrentPage(1);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-gray-100 ${distilleryFilter === "all" ? "bg-amber-50 text-amber-700" : ""}`}
                  >
                    전체
                  </button>
                  {availableDistilleries.map((distillery) => (
                    <button
                      key={distillery}
                      onClick={() => {
                        setDistilleryFilter(distillery);
                        setShowDistilleryFilter(false);
                        setCurrentPage(1);
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
          {paginatedData.map((product: any) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
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
                  onClick={() => {
                    setSelectedProduct(product.id);
                    setProductDetails(product);
                    setIsEditMode(false);
                  }}
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
  );
};
