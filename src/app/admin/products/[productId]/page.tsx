"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import { generateProducts, type Product } from "../../_data/mockData";
import AdminProductDetailSection from "../../components/AdminProductDetailSection";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = use(params);
  const { toggle } = useSidebar();
  const router = useRouter();

  const products = useMemo(() => generateProducts(), []);

  const product = products.find((p) => p.id === Number(productId));
  const [productDetails, setProductDetails] = useState<Product | null>(
    product || null,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  if (!product || !productDetails) {
    return (
      <>
        <AdminHeader
          title="제품 상세"
          onToggleSidebar={toggle}
          showSearch={false}
        />
        <div className="p-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">제품을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push("/admin/products")}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleSave = () => {
    // TODO: API 호출
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setProductDetails(product);
    setIsEditMode(false);
  };

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
            onClick={() => router.push("/admin/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            제품 목록으로 돌아가기
          </button>

          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                편집
              </button>
            )}
          </div>
        </div>

        <AdminProductDetailSection
          isEditMode={isEditMode}
          productDetails={productDetails}
          setProductDetails={setProductDetails}
        />
      </div>
    </>
  );
}
