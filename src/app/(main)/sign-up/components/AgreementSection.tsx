"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface AgreementItem {
  id: string;
  name: string;
  label: string;
  required: boolean;
  hasExpand?: boolean;
}

const agreementItems: AgreementItem[] = [
  {
    id: "terms",
    name: "privacyAgree",
    label: "[필수] 이용약관 동의",
    required: true,
  },
  {
    id: "privacy",
    name: "privacyAgree",
    label: "[필수] 개인 정보 수집 및 이용 동의",
    required: true,
  },
  {
    id: "privacy-optional",
    name: "marketingAgree",
    label: "[선택] 개인 정보 수집 및 이용 동의",
    required: false,
  },
  {
    id: "marketing",
    name: "emailAgree",
    label: "[선택] 광고성 정보 수신 모두 동의",
    required: false,
    hasExpand: true,
  },
];

export function AgreementSection() {
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});

  const allAgreed = agreementItems.every((item) => agreements[item.id]);

  const handleAllAgree = (checked: boolean) => {
    const newAgreements: Record<string, boolean> = {};
    for (const item of agreementItems) {
      newAgreements[item.id] = checked;
    }
    setAgreements(newAgreements);
  };

  const handleAgreementChange = (id: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [id]: checked }));
  };

  // 필수 약관 동의 여부 계산
  const requiredAgreed = agreementItems
    .filter((item) => item.required)
    .every((item) => agreements[item.id]);

  return (
    <div className="w-full">
      {/* All Agree */}
      <div className="mb-4 flex items-start gap-3">
        <Checkbox
          id="all-agree"
          checked={allAgreed}
          onCheckedChange={(checked) => handleAllAgree(checked === true)}
          className="mt-0.5 size-5 rounded border-gray-200 data-[state=checked]:border-gray-200 data-[state=checked]:bg-transparent"
        />
        <div>
          <label
            htmlFor="all-agree"
            className="typo-bold-16 cursor-pointer text-black"
          >
            모두 동의합니다
          </label>
          <p className="typo-regular-12 mt-1 text-gray-500">
            선택 동의 항목 포함
          </p>
        </div>
      </div>

      {/* Individual Agreements */}
      <div className="flex flex-col gap-3 pl-1">
        {agreementItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-5 items-center justify-center",
                  agreements[item.id] ? "text-gray-600" : "text-gray-200",
                )}
              >
                <Check className="size-4" strokeWidth={2.5} />
              </div>
              <button
                type="button"
                onClick={() =>
                  handleAgreementChange(item.id, !agreements[item.id])
                }
                className={cn(
                  "typo-regular-14 text-left",
                  agreements[item.id] ? "text-black" : "text-gray-500",
                )}
              >
                {item.label}
              </button>
            </div>
            <button
              type="button"
              className="typo-regular-12 text-gray-400 underline hover:text-gray-600"
            >
              {item.hasExpand ? "펼치기" : "내용 보기"}
            </button>
          </div>
        ))}
      </div>

      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name="privacyAgree"
        value={String(agreements.terms && agreements.privacy)}
      />
      <input
        type="hidden"
        name="marketingAgree"
        value={String(agreements["privacy-optional"] || false)}
      />
      <input
        type="hidden"
        name="emailAgree"
        value={String(agreements.marketing || false)}
      />
      <input
        type="hidden"
        name="smsAgree"
        value={String(agreements.marketing || false)}
      />
      <input
        type="hidden"
        name="snsAgree"
        value={String(agreements.marketing || false)}
      />
      {/* 필수 약관 동의 상태 (SignUpForm에서 버튼 활성화 판단용) */}
      <input
        type="hidden"
        name="requiredAgreed"
        value={String(requiredAgreed)}
      />
    </div>
  );
}
