"use client";

import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { overlay } from "overlay-kit";
import type { BottleAdminResponse } from "@/apis/generated/api";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import AdminProductDetailView from "../../../components/AdminProductDetailView";
import ProductDeleteModal from "./ProductDeleteModal";

interface ProductDetailContentProps {
  product: BottleAdminResponse;
}

export default function ProductDetailContent({
  product,
}: ProductDetailContentProps) {
  const { toggle } = useSidebar();
  const router = useRouter();

  return (
    <>
      <AdminHeader
        title="제품 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <ArrowLeft size={20} />
            제품 목록으로 돌아가기
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
              className="px-4 py-2 bg-amber-600 text-white cursor-pointer rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <Edit2 size={16} />
              편집
            </button>
            <button
              type="button"
              onClick={() =>
                overlay.open((props) => (
                  <ProductDeleteModal {...props} id={product.id!} />
                ))
              }
              className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        </div>

        <AdminProductDetailView productDetails={product} />
      </div>
    </>
  );
}
