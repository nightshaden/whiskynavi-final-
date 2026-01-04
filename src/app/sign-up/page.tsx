"use client";

import { CalendarIcon, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Gender = "male" | "female" | null;

interface AgreementItem {
  id: string;
  label: string;
  required: boolean;
  hasExpand?: boolean;
}

const agreementItems: AgreementItem[] = [
  { id: "terms", label: "[필수] 이용약관 동의", required: true },
  {
    id: "privacy",
    label: "[필수] 개인 정보 수집 및 이용 동의",
    required: true,
  },
  {
    id: "privacy-optional",
    label: "[선택] 개인 정보 수집 및 이용 동의",
    required: false,
  },
  {
    id: "marketing",
    label: "[선택] 광고성 정보 수신 모두 동의",
    required: false,
    hasExpand: true,
  },
];

const Page = () => {
  const [gender, setGender] = useState<Gender>(null);
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [emailError, setEmailError] = useState(false);
  const [nicknameError, setNicknameError] = useState(false);

  const allAgreed = agreementItems.every((item) => agreements[item.id]);

  const handleAllAgree = (checked: boolean) => {
    const newAgreements: Record<string, boolean> = {};
    agreementItems.forEach((item) => {
      newAgreements[item.id] = checked;
    });
    setAgreements(newAgreements);
  };

  const handleAgreementChange = (id: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [id]: checked }));
  };

  const handleEmailVerify = () => {
    // Mock: toggle error for demo
    setEmailError(true);
  };

  const handleNicknameCheck = () => {
    // Mock: toggle error for demo
    setNicknameError(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#1E2A38]">
      <section className="w-full max-w-[520px] bg-white rounded-2xl px-8 py-10 md:px-12">
        {/* Title */}
        <h1 className="text-center typo-bold-24 text-black mb-8">회원가입</h1>

        <form className="w-full flex flex-col gap-6">
          {/* 이름 (Name) */}
          <div className="w-full">
            <Label
              htmlFor="name"
              className="text-black font-semibold typo-medium-14 block"
            >
              이름
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>

          {/* 생년월일 & 성별 Row */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* 생년월일 (Date of Birth) */}
            <div className="flex-1">
              <Label
                htmlFor="birthdate"
                className="text-black font-semibold typo-medium-14 block"
              >
                생년월일
              </Label>
              <div className="relative">
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="text"
                  placeholder="0000 - 00 - 00"
                  className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black pr-8"
                />
                <CalendarIcon className="absolute right-0 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              </div>
            </div>

            {/* 성별 (Gender) */}
            <fieldset className="self-stretch w-full md:w-auto flex flex-col justify-between">
              <legend className="text-black font-semibold typo-medium-14">
                성별
              </legend>
              <ButtonGroup
                role="radiogroup"
                aria-label="성별 선택"
                className="mt-auto [&>*:first-child]:rounded-l-[10px] [&>*:last-child]:rounded-r-[10px]"
              >
                <Button
                  type="button"
                  variant="outline"
                  role="radio"
                  aria-checked={gender === "male"}
                  onClick={() => setGender("male")}
                  className={cn(
                    "h-7 typo-medium-14 transition-colors border-gray-200",
                    gender === "male"
                      ? "bg-[#1E2A38] text-white border-[#1E2A38] hover:bg-[#1E2A38] hover:text-white"
                      : "bg-white text-black hover:bg-gray-50",
                  )}
                >
                  남
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  role="radio"
                  aria-checked={gender === "female"}
                  onClick={() => setGender("female")}
                  className={cn(
                    "h-7 typo-medium-14 transition-colors border-gray-200",
                    gender === "female"
                      ? "bg-[#1E2A38] text-white border-[#1E2A38] hover:bg-[#1E2A38] hover:text-white"
                      : "bg-white text-black hover:bg-gray-50",
                  )}
                >
                  여
                </Button>
              </ButtonGroup>
            </fieldset>
          </div>

          {/* 이메일 (Email) */}
          <div className="w-full">
            <Label
              htmlFor="email"
              className="text-black font-semibold typo-medium-14 block"
            >
              이메일
            </Label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ex) whiskynavi@whiskynavi.com"
                  className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
                />
              </div>
              <Button
                type="button"
                onClick={handleEmailVerify}
                className="px-5 py-2.5 h-auto bg-[#1E2A38] text-white typo-medium-14 rounded-[10px] hover:bg-[#2a3a4d] mb-px"
              >
                인증하기
              </Button>
            </div>
            {emailError && (
              <p className="mt-2 text-red-500 typo-regular-12">
                * 이미 등록된 이메일입니다.
              </p>
            )}
          </div>

          {/* 비밀번호 (Password) */}
          <div className="w-full">
            <Label
              htmlFor="password"
              className="text-black font-semibold typo-medium-14 block"
            >
              비밀번호
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="8~16자, 영문 대소문자/숫자/특수문자 중 2가지 이상 조합"
              className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>

          {/* 비밀번호 확인 (Confirm Password) */}
          <div className="w-full">
            <Label
              htmlFor="confirmPassword"
              className="text-black font-semibold typo-medium-14 block"
            >
              비밀번호 확인
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
            />
          </div>

          {/* 닉네임 (Nickname) */}
          <div className="w-full">
            <Label
              htmlFor="nickname"
              className="text-black font-semibold typo-medium-14 block"
            >
              닉네임
            </Label>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
                />
              </div>
              <Button
                type="button"
                onClick={handleNicknameCheck}
                className="px-5 py-2.5 h-auto bg-[#1E2A38] text-white typo-medium-14 rounded-[10px] hover:bg-[#2a3a4d] mb-px"
              >
                중복확인
              </Button>
            </div>
            {nicknameError && (
              <p className="mt-2 text-red-500 typo-regular-12">
                * 해당 닉네임은 사용할 수 없습니다.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200 my-2" />

          {/* Agreement Section */}
          <div className="w-full">
            {/* All Agree */}
            <div className="flex items-start gap-3 mb-4">
              <Checkbox
                id="all-agree"
                checked={allAgreed}
                onCheckedChange={(checked) => handleAllAgree(checked === true)}
                className="mt-0.5 size-5 rounded border-gray-200 data-[state=checked]:bg-transparent data-[state=checked]:border-gray-200"
              />
              <div>
                <label
                  htmlFor="all-agree"
                  className="text-black typo-bold-16 cursor-pointer"
                >
                  모두 동의합니다
                </label>
                <p className="text-gray-500 typo-regular-12 mt-1">
                  선택 동의 항목 포함
                </p>
              </div>
            </div>

            {/* Individual Agreements */}
            <div className="flex flex-col gap-3 pl-1">
              {agreementItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-5 flex items-center justify-center",
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
                        "text-left typo-regular-14",
                        agreements[item.id] ? "text-black" : "text-gray-500",
                      )}
                    >
                      {item.label}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 typo-regular-12 underline hover:text-gray-600"
                  >
                    {item.hasExpand ? "펼치기" : "내용 보기"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 mt-4 bg-[#1E2A38] text-white typo-medium-16 rounded-[10px] hover:bg-[#2a3a4d]"
          >
            가입하기
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Page;
