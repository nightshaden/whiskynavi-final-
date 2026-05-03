"use client";

import type { PostApiAuthSignupBody } from "@/apis/generated/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

// --- 약관 내용 ---

const TERMS_CONTENT: Record<string, { title: string; content: string }> = {
  terms: {
    title: "이용약관",
    content: `제1조 (목적)
이 약관은 위스키네비(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 모든 온라인 서비스를 의미합니다.
2. "회원"이란 이 약관에 동의하고 회원가입을 완료한 자를 의미합니다.
3. "아이디"란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인한 문자와 숫자의 조합을 의미합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.
2. 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경된 약관은 공지사항을 통해 공지합니다.

제4조 (서비스의 제공)
1. 회사는 다음과 같은 서비스를 제공합니다.
  - 위스키 정보 검색 및 리뷰 서비스
  - 매장 예약 및 관리 서비스
  - 기타 회사가 정하는 서비스

제5조 (회원의 의무)
1. 회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.
2. 회원은 서비스 이용과 관련하여 다음 각 호의 행위를 하여서는 안 됩니다.
  - 타인의 정보 도용
  - 회사가 게시한 정보의 변경
  - 회사가 정한 정보 이외의 정보 송신 또는 게시
  - 기타 불법적이거나 부당한 행위`,
  },
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    content: `1. 수집하는 개인정보 항목
- 필수항목: 이름, 이메일, 비밀번호, 휴대폰번호, 생년월일, 성별
- 본인인증 시: NICE 인증 정보 (CI, DI)

2. 개인정보의 수집 및 이용 목적
- 회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정이용 방지, 가입 의사 확인, 연령 확인
- 서비스 제공: 매장 예약, 위스키 정보 제공, 맞춤형 서비스 제공

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간까지)
  · 계약 또는 청약철회 등에 관한 기록: 5년
  · 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
  · 접속에 관한 기록: 1년

4. 동의를 거부할 권리
귀하는 위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부하실 경우 회원가입이 제한됩니다.`,
  },
};

// --- 타입 ---

interface AgreementItem {
  id: string;
  label: string;
  required: boolean;
  hasExpand?: boolean;
}

const agreementItems: AgreementItem[] = [
  {
    id: "terms",
    label: "[필수] 이용약관 동의",
    required: true,
  },
  {
    id: "privacy",
    label: "[필수] 개인 정보 수집 및 이용 동의",
    required: true,
  },
  {
    id: "marketing",
    label: "[선택] 광고성 정보 수신 모두 동의",
    required: false,
    hasExpand: true,
  },
];

const marketingSubItems = [
  { id: "sub-email", label: "이메일 수신 동의" },
  { id: "sub-sms", label: "SMS 수신 동의" },
  { id: "sub-sns", label: "SNS 수신 동의" },
];

type SignupAgreementField = keyof Pick<
  PostApiAuthSignupBody,
  "privacyAgree" | "marketingAgree" | "emailAgree" | "smsAgree" | "snsAgree"
>;

// --- Component ---

export function AgreementSection() {
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [viewingTerms, setViewingTerms] = useState<string | null>(null);
  const [isMarketingExpanded, setIsMarketingExpanded] = useState(false);

  const allAgreed = [...agreementItems, ...marketingSubItems].every((item) => agreements[item.id]);

  const handleAllAgree = (checked: boolean) => {
    const newAgreements: Record<string, boolean> = {};
    for (const item of agreementItems) {
      newAgreements[item.id] = checked;
    }
    for (const item of marketingSubItems) {
      newAgreements[item.id] = checked;
    }
    setAgreements(newAgreements);
  };

  const handleAgreementChange = (id: string, checked: boolean) => {
    setAgreements((prev) => {
      const next = { ...prev, [id]: checked };

      // 마케팅 전체 동의 시 하위 항목도 동기화
      if (id === "marketing") {
        for (const sub of marketingSubItems) {
          next[sub.id] = checked;
        }
      }

      // 하위 항목 변경 시 마케팅 전체 동의 상태 동기화
      if (marketingSubItems.some((sub) => sub.id === id)) {
        next.marketing = marketingSubItems.every((sub) => next[sub.id]);
      }

      return next;
    });
  };

  const requiredAgreed = agreementItems.filter((item) => item.required).every((item) => agreements[item.id]);
  const marketingAgreed = agreements.marketing ?? false;
  const emailAgreed = agreements["sub-email"] ?? false;
  const smsAgreed = agreements["sub-sms"] ?? false;
  const snsAgreed = agreements["sub-sns"] ?? false;
  const signupAgreementValues: Record<SignupAgreementField, boolean> = {
    privacyAgree: requiredAgreed,
    marketingAgree: marketingAgreed,
    emailAgree: emailAgreed,
    smsAgree: smsAgreed,
    snsAgree: snsAgreed,
  };
  console.log("signupAgreementValues", signupAgreementValues);
  const termsData = viewingTerms ? TERMS_CONTENT[viewingTerms] : null;

  return (
    <div className="w-full">
      {/* All Agree */}
      <div className="mb-4 flex items-start gap-3">
        <Checkbox
          id="all-agree"
          checked={allAgreed}
          onCheckedChange={(checked) => handleAllAgree(checked === true)}
          className="mt-0.5 size-5 rounded border-gray-200 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
        />
        <div>
          <label htmlFor="all-agree" className="typo-bold-16 cursor-pointer text-black">
            모두 동의합니다
          </label>
          <p className="typo-regular-12 mt-1 text-gray-500">선택 동의 항목 포함</p>
        </div>
      </div>

      {/* Individual Agreements */}
      <div className="flex flex-col gap-3 pl-1">
        {agreementItems.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between">
              <label htmlFor={`agreement-${item.id}`} className="flex cursor-pointer items-center gap-3">
                <Checkbox
                  id={`agreement-${item.id}`}
                  checked={agreements[item.id] ?? false}
                  onCheckedChange={(checked) => handleAgreementChange(item.id, checked === true)}
                  className="size-5 rounded border-gray-200 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                />
                <span className={cn("typo-regular-14 text-left", agreements[item.id] ? "text-black" : "text-gray-500")}>
                  {item.label}
                </span>
              </label>
              {item.hasExpand ? (
                <button
                  type="button"
                  onClick={() => setIsMarketingExpanded((prev) => !prev)}
                  className="typo-regular-12 flex items-center gap-0.5 text-gray-400 hover:text-gray-600"
                >
                  {isMarketingExpanded ? "접기" : "펼치기"}
                  <ChevronDown className={cn("size-3.5 transition-transform", isMarketingExpanded && "rotate-180")} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewingTerms(item.id)}
                  className="typo-regular-12 text-gray-400 underline hover:text-gray-600"
                >
                  내용 보기
                </button>
              )}
            </div>

            {/* 마케팅 하위 항목 */}
            {item.hasExpand && isMarketingExpanded && (
              <div className="mt-2 flex flex-col gap-2 pl-8">
                {marketingSubItems.map((sub) => (
                  <label
                    htmlFor={`agreement-${sub.id}`}
                    key={sub.id}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <Checkbox
                      id={`agreement-${sub.id}`}
                      checked={agreements[sub.id] ?? false}
                      onCheckedChange={(checked) => handleAgreementChange(sub.id, checked === true)}
                      className="size-4 rounded border-gray-200 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                    />
                    <span
                      className={cn("typo-regular-13 text-left", agreements[sub.id] ? "text-black" : "text-gray-500")}
                    >
                      {sub.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 약관 내용 Dialog */}
      <Dialog open={!!viewingTerms} onOpenChange={(open) => !open && setViewingTerms(null)}>
        <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{termsData?.title}</DialogTitle>
          </DialogHeader>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{termsData?.content}</div>
        </DialogContent>
      </Dialog>

      {/* Hidden inputs for form submission */}
      {Object.entries(signupAgreementValues).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      <input type="hidden" name="requiredAgreed" value={String(requiredAgreed)} />
    </div>
  );
}
