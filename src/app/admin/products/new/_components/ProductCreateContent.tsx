"use client";

import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import AdminHeader from "../../../_components/AdminHeader";
import { useSidebar } from "../../../_components/AdminLayoutClient";
import AdminProductDetailEdit from "../../../components/AdminProductDetailEdit";
import { createBottleFormAction } from "../../actions";

export default function ProductCreateContent() {
  const { toggle } = useSidebar();
  const router = useRouter();

  const [formState, formAction, isPending] = useActionState(
    createBottleFormAction,
    { success: false },
  );

  return (
    <>
      <AdminHeader
        title="제품 등록"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <form action={formAction} className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            제품 목록으로 돌아가기
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            <Save size={16} />
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>

        {formState.error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {formState.error}
          </div>
        )}

        <AdminProductDetailEdit />
      </form>
    </>
  );
}
