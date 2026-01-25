"use client";

import { useState } from "react";
import { Edit2, Save, X, Check } from "lucide-react";
import AdminHeader from "../_components/AdminHeader";
import { useSidebar } from "../_components/AdminLayoutClient";
import {
  initialMembershipBenefits,
  type MembershipBenefits,
} from "../_data/mockData";

export default function MembershipPage() {
  const { toggle } = useSidebar();
  const [selectedBrand, setSelectedBrand] = useState<"navi" | "tales">("navi");
  const [isEditMode, setIsEditMode] = useState(false);
  const [membershipBenefits, setMembershipBenefits] =
    useState<MembershipBenefits>(initialMembershipBenefits);
  const [editingBenefits, setEditingBenefits] = useState<MembershipBenefits>(
    initialMembershipBenefits,
  );

  const handleEdit = () => {
    setEditingBenefits(membershipBenefits);
    setIsEditMode(true);
  };

  const handleSave = () => {
    setMembershipBenefits(editingBenefits);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditingBenefits(membershipBenefits);
    setIsEditMode(false);
  };

  const tiers: ("VIP" | "GOLD" | "SILVER")[] = ["VIP", "GOLD", "SILVER"];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "bg-amber-500 text-white";
      case "GOLD":
        return "bg-yellow-400 text-gray-900";
      case "SILVER":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const currentBenefits = isEditMode
    ? editingBenefits[selectedBrand]
    : membershipBenefits[selectedBrand];

  return (
    <>
      <AdminHeader
        title="멤버십 관리"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        {/* 브랜드 선택 탭 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedBrand("navi")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedBrand === "navi"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            위스키내비
          </button>
          <button
            onClick={() => setSelectedBrand("tales")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedBrand === "tales"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            더 위스키테일즈
          </button>
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedBrand === "navi" ? "위스키내비" : "더 위스키테일즈"} 멤버십
            혜택
          </h2>
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
                onClick={handleEdit}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                편집
              </button>
            )}
          </div>
        </div>

        {/* 멤버십 혜택 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const benefits = currentBenefits[tier];
            return (
              <div
                key={tier}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* 헤더 */}
                <div className={`px-6 py-4 ${getTierColor(tier)}`}>
                  <h3 className="text-xl font-bold">{tier}</h3>
                </div>

                {/* 혜택 내용 */}
                <div className="p-6 space-y-4">
                  {/* 할인율 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">할인율</span>
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={benefits.discount}
                          onChange={(e) => {
                            const newBenefits = { ...editingBenefits };
                            newBenefits[selectedBrand][tier].discount = Number(
                              e.target.value,
                            );
                            setEditingBenefits(newBenefits);
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <span className="font-bold text-amber-600">
                        {benefits.discount}%
                      </span>
                    )}
                  </div>

                  {/* 얼리 액세스 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">얼리 액세스</span>
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={benefits.earlyAccess}
                          onChange={(e) => {
                            const newBenefits = { ...editingBenefits };
                            newBenefits[selectedBrand][tier].earlyAccess =
                              Number(e.target.value);
                            setEditingBenefits(newBenefits);
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                        <span>일</span>
                      </div>
                    ) : (
                      <span className="font-bold">
                        {benefits.earlyAccess}일 전
                      </span>
                    )}
                  </div>

                  {/* 무료 배송 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">무료 배송</span>
                    {isEditMode ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={benefits.freeShipping}
                          onChange={(e) => {
                            const newBenefits = { ...editingBenefits };
                            newBenefits[selectedBrand][tier].freeShipping =
                              e.target.checked;
                            setEditingBenefits(newBenefits);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    ) : benefits.freeShipping ? (
                      <Check className="text-green-600" size={20} />
                    ) : (
                      <X className="text-gray-400" size={20} />
                    )}
                  </div>

                  {/* 독점 제품 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">독점 제품 접근</span>
                    {isEditMode ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={benefits.exclusiveProducts}
                          onChange={(e) => {
                            const newBenefits = { ...editingBenefits };
                            newBenefits[selectedBrand][tier].exclusiveProducts =
                              e.target.checked;
                            setEditingBenefits(newBenefits);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    ) : benefits.exclusiveProducts ? (
                      <Check className="text-green-600" size={20} />
                    ) : (
                      <X className="text-gray-400" size={20} />
                    )}
                  </div>

                  {/* 우선 지원 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">우선 고객 지원</span>
                    {isEditMode ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={benefits.prioritySupport}
                          onChange={(e) => {
                            const newBenefits = { ...editingBenefits };
                            newBenefits[selectedBrand][tier].prioritySupport =
                              e.target.checked;
                            setEditingBenefits(newBenefits);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    ) : benefits.prioritySupport ? (
                      <Check className="text-green-600" size={20} />
                    ) : (
                      <X className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
