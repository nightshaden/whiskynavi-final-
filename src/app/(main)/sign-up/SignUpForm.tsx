"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { type SignUpState, signUpAction } from "./actions";
import {
  AgreementSection,
  EmailField,
  GenderSelector,
  UsernameField,
} from "./components";

const initialState: SignUpState = {
  success: false,
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  // 검증 상태 관리 (최소한의 state - boolean 2개만)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isUsernameVerified, setIsUsernameVerified] = useState(false);

  // 회원가입 버튼 활성화 조건
  const canSubmit = isEmailVerified && isUsernameVerified && !isPending;

  return (
    <form action={formAction} className="flex w-full flex-col gap-6">
      {/* 이름 (Name) */}
      <div className="w-full">
        <Label
          htmlFor="name"
          className="typo-medium-14 block font-semibold text-black"
        >
          이름
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
        />
      </div>

      {/* 생년월일 & 성별 Row */}
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* 생년월일 (Date of Birth) */}
        <div className="flex-1">
          <Label
            htmlFor="birthDate"
            className="typo-medium-14 block font-semibold text-black"
          >
            생년월일
          </Label>
          <div className="relative">
            <Input
              id="birthDate"
              name="birthDate"
              type="text"
              placeholder="0000 - 00 - 00"
              className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 pr-8 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
            />
            <CalendarIcon className="absolute top-1/2 right-0 size-5 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* 성별 (Gender) - 별도 컴포넌트 */}
        <GenderSelector />
      </div>

      {/* 이메일 (Email) - 별도 컴포넌트 (중복확인 포함) */}
      <EmailField
        onValidationChange={setIsEmailVerified}
        error={state.fieldErrors?.email}
      />

      {/* 비밀번호 (Password) */}
      <div className="w-full">
        <Label
          htmlFor="password"
          className="typo-medium-14 block font-semibold text-black"
        >
          비밀번호
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="8~16자, 영문 대소문자/숫자/특수문자 중 2가지 이상 조합"
          className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
        />
        {state.fieldErrors?.password && (
          <p className="typo-regular-12 mt-2 text-red-500">
            * {state.fieldErrors.password}
          </p>
        )}
      </div>

      {/* 비밀번호 확인 (Confirm Password) */}
      <div className="w-full">
        <Label
          htmlFor="confirmPassword"
          className="typo-medium-14 block font-semibold text-black"
        >
          비밀번호 확인
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
        />
      </div>

      {/* 닉네임 (Username) - 별도 컴포넌트 (중복확인 포함) */}
      <UsernameField
        onValidationChange={setIsUsernameVerified}
        error={state.fieldErrors?.username}
      />

      {/* Divider */}
      <div className="my-2 h-px w-full bg-gray-200" />

      {/* Agreement Section - 별도 컴포넌트 */}
      <AgreementSection />

      {/* Error Message */}
      {state.error && (
        <p className="text-center text-sm text-red-500">{state.error}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="typo-medium-16 mt-4 h-14 w-full rounded-[10px] bg-[#1E2A38] text-white hover:bg-[#2a3a4d] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "가입 중..." : "가입하기"}
      </Button>

      {/* 미검증 상태 안내 */}
      {(!isEmailVerified || !isUsernameVerified) && (
        <p className="text-center text-xs text-gray-500">
          {!isEmailVerified && !isUsernameVerified
            ? "이메일과 닉네임 중복 확인이 필요합니다."
            : !isEmailVerified
              ? "이메일 중복 확인이 필요합니다."
              : "닉네임 중복 확인이 필요합니다."}
        </p>
      )}
    </form>
  );
}
