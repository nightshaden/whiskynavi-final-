"use client";
import { CalendarDays, Plus, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";

interface ProductDetailSectionProps {
  isEditMode: boolean;
  productDetails: any;
  setProductDetails: (details: any) => void;
}

export default function AdminProductDetailSection({
  isEditMode,
  productDetails,
  setProductDetails,
}: ProductDetailSectionProps) {
  const [newExtraInfoKey, setNewExtraInfoKey] = useState("");
  const [newExtraInfoValue, setNewExtraInfoValue] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const defaultImage =
    "https://images.unsplash.com/photo-1643506926423-ba467010591c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGlza2V5JTIwYm90dGxlJTIwcHJvZHVjdHxlbnwxfHx8fDE3Njg4Nzc1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080";

  // imgUrls 배열 보장 (기존 imgUrl을 배열로 변환)
  const imgUrls: string[] =
    productDetails.imgUrls ||
    (productDetails.imgUrl ? [productDetails.imgUrl] : []);
  const currentImage =
    imgUrls.length > 0 ? imgUrls[selectedImageIndex] : defaultImage;

  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImgUrls = [...imgUrls, reader.result as string];
      setProductDetails({
        ...productDetails,
        imgUrls: newImgUrls,
        imgUrl: newImgUrls[0], // 첫 번째 이미지를 imgUrl에도 저장
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const newImgUrls = imgUrls.filter((_, i) => i !== index);
    setProductDetails({
      ...productDetails,
      imgUrls: newImgUrls,
      imgUrl: newImgUrls[0] || "",
    });
    if (selectedImageIndex >= newImgUrls.length) {
      setSelectedImageIndex(Math.max(0, newImgUrls.length - 1));
    }
  };

  const handleAddExtraInfo = () => {
    if (newExtraInfoKey.trim() && newExtraInfoValue.trim()) {
      setProductDetails({
        ...productDetails,
        extraInfos: {
          ...productDetails.extraInfos,
          [newExtraInfoKey]: newExtraInfoValue,
        },
      });
      setNewExtraInfoKey("");
      setNewExtraInfoValue("");
    }
  };

  const handleRemoveExtraInfo = (key: string) => {
    const newExtraInfos = { ...productDetails.extraInfos };
    delete newExtraInfos[key];
    setProductDetails({
      ...productDetails,
      extraInfos: newExtraInfos,
    });
  };

  return (
    <>
      {isEditMode ? (
        // 편집 모드 - 3컬럼 레이아웃 (왼쪽: 항목들, 중간: 설명, 오른쪽: 이미지)
        <div className="bg-white rounded-lg p-4">
          <div className="flex gap-6 divide-x divide-gray-200">
            {/* 왼쪽: 모든 필드 (설명 제외) */}
            <div className="flex-1 space-y-2 pr-6">
              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">제품명</Label>
                <input
                  type="text"
                  value={productDetails.name}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      name: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">브랜드</Label>
                <input
                  type="text"
                  value={productDetails.brand}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      brand: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">시리즈</Label>
                <input
                  type="text"
                  value={productDetails.series || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      series: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">회사</Label>
                <input
                  type="text"
                  value={productDetails.company || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      company: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">증류소</Label>
                <input
                  type="text"
                  value={productDetails.distillery || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      distillery: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">몰트 타입</Label>
                <input
                  type="text"
                  value={productDetails.maltType || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      maltType: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">
                  캐스크 타입
                </Label>
                <input
                  type="text"
                  value={productDetails.caskType || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      caskType: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">
                  캐스크 번호
                </Label>
                <input
                  type="text"
                  value={productDetails.caskNumber || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      caskNumber: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">
                  알코올 도수 (%)
                </Label>
                <input
                  type="number"
                  step="0.1"
                  value={productDetails.abv || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      abv: parseFloat(e.target.value) || null,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">용량 (ml)</Label>
                <input
                  type="number"
                  value={productDetails.capacity || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      capacity: parseInt(e.target.value) || null,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3 items-center">
                <Label className="w-32 text-sm text-gray-700">증류 날짜</Label>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={productDetails.distillationDate || ""}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        distillationDate: e.target.value,
                      })
                    }
                    className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <CalendarDays
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <Label className="w-32 text-sm text-gray-700">병입 날짜</Label>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={productDetails.bottledDate || ""}
                    onChange={(e) =>
                      setProductDetails({
                        ...productDetails,
                        bottledDate: e.target.value,
                      })
                    }
                    className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <CalendarDays
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={14}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">
                  숙성년수 (년)
                </Label>
                <input
                  type="number"
                  value={productDetails.agingYears || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      agingYears: parseInt(e.target.value) || null,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Label className="w-32 text-sm text-gray-700">
                  전체 수량 (병)
                </Label>
                <input
                  type="number"
                  value={productDetails.totalQuantity || ""}
                  onChange={(e) =>
                    setProductDetails({
                      ...productDetails,
                      totalQuantity: parseInt(e.target.value) || null,
                    })
                  }
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              {/* 추가 정보 */}
              <div className="pt-2 border-t">
                <Label className="text-sm text-gray-700 font-semibold block mb-2">
                  추가 정보
                </Label>
                <div className="space-y-2">
                  {Object.entries(productDetails.extraInfos || {}).map(
                    ([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newExtraInfos = {
                              ...productDetails.extraInfos,
                            };
                            const oldValue = newExtraInfos[key];
                            delete newExtraInfos[key];
                            newExtraInfos[e.target.value] = oldValue;
                            setProductDetails({
                              ...productDetails,
                              extraInfos: newExtraInfos,
                            });
                          }}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="키"
                        />
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => {
                            setProductDetails({
                              ...productDetails,
                              extraInfos: {
                                ...productDetails.extraInfos,
                                [key]: e.target.value,
                              },
                            });
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="값"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraInfo(key)}
                          className="px-2 py-1 text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ),
                  )}

                  {/* 새 추가 정보 입력 */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newExtraInfoKey}
                      onChange={(e) => setNewExtraInfoKey(e.target.value)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="새 키"
                    />
                    <input
                      type="text"
                      value={newExtraInfoValue}
                      onChange={(e) => setNewExtraInfoValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="새 값"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtraInfo}
                      className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 중간: 설명 */}
            <div className="flex-1 px-6">
              <div className="text-sm text-gray-600 mb-1">설명</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {productDetails.description || "설명이 없습니다."}
              </div>
            </div>

            {/* 오른쪽: 이미지 */}
            <div className="flex-1 flex flex-col pl-6">
              {/* 큰 이미지 */}
              <div className="relative mb-4 group">
                <Image
                  src={currentImage}
                  width={320}
                  height={320}
                  alt={productDetails.name}
                  className="w-full h-80 object-cover rounded border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors font-semibold text-sm flex items-center gap-2">
                    <Upload size={18} />
                    이미지 추가
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAddImage(file);
                        }
                      }}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              {/* 썸네일 리스트 */}
              <div className="flex flex-wrap gap-2">
                {imgUrls.map((url, index) => (
                  <div key={url} className="relative group/thumb">
                    <Image
                      src={url}
                      width={16}
                      height={16}
                      alt={`Product ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded border-2 cursor-pointer transition-all ${
                        index === selectedImageIndex
                          ? "border-amber-600 ring-2 ring-amber-300"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 보기 모드 - 3컬럼 레이아웃 (왼쪽: 항목들, 중간: 설명, 오른쪽: 이미지)
        <div className="bg-white rounded-lg p-4">
          <div className="flex gap-6 divide-x divide-gray-200">
            {/* 왼쪽: 모든 필드 (설명 제외) */}
            <div className="flex-1 space-y-2 pr-6">
              <div className="flex gap-3">
                <span className="w-32 text-sm text-gray-600">제품명</span>
                <span className="flex-1 text-sm text-gray-900">
                  {productDetails.name}
                </span>
              </div>

              <div className="flex gap-3">
                <span className="w-32 text-sm text-gray-600">브랜드</span>
                <span className="flex-1 text-sm text-gray-900">
                  {productDetails.brand}
                </span>
              </div>

              {productDetails.series && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">시리즈</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.series}
                  </span>
                </div>
              )}

              {productDetails.company && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">회사</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.company}
                  </span>
                </div>
              )}

              {productDetails.distillery && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">증류소</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.distillery}
                  </span>
                </div>
              )}

              {productDetails.maltType && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">몰트 타입</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.maltType}
                  </span>
                </div>
              )}

              {productDetails.caskType && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">
                    캐스크 타입
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.caskType}
                  </span>
                </div>
              )}

              {productDetails.caskNumber && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">
                    캐스크 번호
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.caskNumber}
                  </span>
                </div>
              )}

              {productDetails.abv && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">
                    알코올 도수
                  </span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.abv}%
                  </span>
                </div>
              )}

              {productDetails.capacity && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">용량</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.capacity}ml
                  </span>
                </div>
              )}

              {productDetails.distillationDate && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">증류 날짜</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.distillationDate}
                  </span>
                </div>
              )}

              {productDetails.bottledDate && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">병입 날짜</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.bottledDate}
                  </span>
                </div>
              )}

              {productDetails.agingYears && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">숙성년수</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.agingYears}년
                  </span>
                </div>
              )}

              {productDetails.totalQuantity && (
                <div className="flex gap-3">
                  <span className="w-32 text-sm text-gray-600">전체 수량</span>
                  <span className="flex-1 text-sm text-gray-900">
                    {productDetails.totalQuantity}병
                  </span>
                </div>
              )}

              {/* 추가 정보 */}
              {productDetails.extraInfos &&
                Object.keys(productDetails.extraInfos).length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600 font-semibold mb-2">
                      추가 정보
                    </div>
                    {Object.entries(productDetails.extraInfos).map(
                      ([key, value]) => (
                        <div key={key} className="flex gap-3">
                          <span className="w-32 text-sm text-gray-600">
                            {key}
                          </span>
                          <span className="flex-1 text-sm text-gray-900">
                            {value as string}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>

            {/* 중간: 설명 */}
            <div className="flex-1 px-6">
              <div className="text-sm text-gray-600 mb-1">설명</div>
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                {productDetails.description || "설명이 없습니다."}
              </div>
            </div>

            {/* 오른쪽: 이미지 */}
            <div className="flex-1 flex flex-col pl-6">
              {/* 큰 이미지 */}
              <div className="relative mb-4 group">
                <Image
                  src={currentImage}
                  width={320}
                  height={320}
                  alt={productDetails.name}
                  className="w-full h-80 object-cover rounded border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors font-semibold text-sm flex items-center gap-2">
                    <Upload size={18} />
                    이미지 추가
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleAddImage(file);
                        }
                      }}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
              {/* 썸네일 리스트 */}
              <div className="flex flex-wrap gap-2">
                {imgUrls.map((url, index) => (
                  <div key={url} className="relative group/thumb">
                    <Image
                      src={url}
                      width={64}
                      height={64}
                      alt={`Product ${index + 1}`}
                      className={`w-16 h-16 object-cover rounded border-2 cursor-pointer transition-all ${
                        index === selectedImageIndex
                          ? "border-amber-600 ring-2 ring-amber-300"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
