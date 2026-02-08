"use client";

import { ArrowLeft, Award, Check, Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";

interface MembershipBenefit {
  discount: number;
  earlyAccess: number;
  freeShipping: boolean;
  exclusiveProducts: boolean;
  prioritySupport: boolean;
}

interface BrandBenefits {
  member: MembershipBenefit;
}

interface MembershipBenefitsData {
  navi: BrandBenefits;
  tales: BrandBenefits;
}

// TODO: 혜택 API가 준비되면 서버에서 초기 데이터를 props로 전달받도록 변경
const DEFAULT_BENEFITS: MembershipBenefitsData = {
  navi: {
    member: {
      discount: 10,
      earlyAccess: 2,
      freeShipping: true,
      exclusiveProducts: true,
      prioritySupport: true,
    },
  },
  tales: {
    member: {
      discount: 10,
      earlyAccess: 2,
      freeShipping: true,
      exclusiveProducts: true,
      prioritySupport: true,
    },
  },
};

export default function MembershipBenefitsContent() {
  const { toggle } = useSidebar();
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [benefits, setBenefits] =
    useState<MembershipBenefitsData>(DEFAULT_BENEFITS);
  const [editingBenefits, setEditingBenefits] =
    useState<MembershipBenefitsData>(DEFAULT_BENEFITS);

  const handleEdit = () => {
    setEditingBenefits(benefits);
    setIsEditMode(true);
  };

  const handleSave = () => {
    setBenefits(editingBenefits);
    setIsEditMode(false);
    // TODO: 서버 액션으로 저장 API 호출
  };

  const handleCancel = () => {
    setEditingBenefits(benefits);
    setIsEditMode(false);
  };

  const brands: Array<{ key: "navi" | "tales"; label: string }> = [
    { key: "navi", label: "NAVI 회원" },
    { key: "tales", label: "TALES 회원" },
  ];

  const currentBenefits = isEditMode ? editingBenefits : benefits;

  const updateBenefit = (
    brand: "navi" | "tales",
    field: keyof MembershipBenefit,
    value: number | boolean,
  ) => {
    setEditingBenefits((prev) => ({
      ...prev,
      [brand]: {
        member: {
          ...prev[brand].member,
          [field]: value,
        },
      },
    }));
  };

  return (
    <>
      <AdminHeader
        title="멤버십 혜택 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => router.push("/admin/membership")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">멤버십 관리로 돌아가기</span>
          </button>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  저장
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <X size={16} />
                  취소
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit2 size={16} />
                편집
              </button>
            )}
          </div>
        </div>

        {/* 혜택 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brands.map(({ key, label }) => {
            const brandBenefits = currentBenefits[key].member;

            return (
              <div
                key={key}
                className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-amber-600">{label}</h3>
                  <Award className="text-amber-600" size={32} />
                </div>

                <div className="space-y-3">
                  {isEditMode ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          할인율 (%)
                        </label>
                        <input
                          type="number"
                          value={brandBenefits.discount}
                          onChange={(e) =>
                            updateBenefit(key, "discount", Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          조기 접근 (일)
                        </label>
                        <input
                          type="number"
                          value={brandBenefits.earlyAccess}
                          onChange={(e) =>
                            updateBenefit(
                              key,
                              "earlyAccess",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">무료 배송</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={brandBenefits.freeShipping}
                            onChange={(e) =>
                              updateBenefit(
                                key,
                                "freeShipping",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">
                          독점 제품 액세스
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={brandBenefits.exclusiveProducts}
                            onChange={(e) =>
                              updateBenefit(
                                key,
                                "exclusiveProducts",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700">
                          우선 고객 지원
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={brandBenefits.prioritySupport}
                            onChange={(e) =>
                              updateBenefit(
                                key,
                                "prioritySupport",
                                e.target.checked,
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">할인율</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {brandBenefits.discount}%
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">조기 접근</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {brandBenefits.earlyAccess}일
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">무료 배송</span>
                        {brandBenefits.freeShipping ? (
                          <Check className="text-green-600" size={20} />
                        ) : (
                          <X className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">독점 제품</span>
                        {brandBenefits.exclusiveProducts ? (
                          <Check className="text-green-600" size={20} />
                        ) : (
                          <X className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-gray-600">우선 지원</span>
                        {brandBenefits.prioritySupport ? (
                          <Check className="text-green-600" size={20} />
                        ) : (
                          <X className="text-gray-400" size={20} />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
