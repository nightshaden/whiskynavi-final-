"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { useActionState, useCallback, useState } from "react";
import { type SignUpState, signUpAction } from "./actions";
import {
  AgreementSection,
  BirthDateInput,
  EmailField,
  GenderSelector,
  UsernameField,
} from "./_components";

const initialState: SignUpState = {
  success: false,
};

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialState,
  );

  // controlled inputs — 에러 시 값 유지
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 3) {
        setPhone(digits);
      } else if (digits.length <= 7) {
        setPhone(`${digits.slice(0, 3)}-${digits.slice(3)}`);
      } else {
        setPhone(
          `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`,
        );
      }
    },
    [],
  );

  // 검증 상태 관리
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
        />
      </div>

      {/* 전화번호 (Phone) */}
      <div className="w-full">
        <Label
          htmlFor="phone"
          className="typo-medium-14 block font-semibold text-black"
        >
          전화번호
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          maxLength={13}
          value={phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
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
            <BirthDateInput />
            <CalendarIcon className="absolute top-1/2 right-0 size-5 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* 성별 (Gender) - 별도 컴포넌트 */}
        <GenderSelector />
      </div>

      {/* 이메일 (Email) - 별도 컴포넌트 (이메일 인증 포함) */}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            ? "이메일과 닉네임 인증이 필요합니다."
            : !isEmailVerified
              ? "이메일 인증이 필요합니다."
              : "닉네임 중복 확인이 필요합니다."}
        </p>
      )}
    </form>
  );
}
