"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconGoogle, IconKakao, IconNaver } from "@/icons";
import { type SignInState, signInAction } from "./actions";

const initialState: SignInState = {
  success: false,
};

export function SignInForm() {
  const [{ error }, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="w-full">
        {/* Email Input */}
        <div className="w-full mt-6">
          <Label
            htmlFor="email"
            className="text-white font-semibold typo-medium-13 block"
          >
            이메일 주소
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ex) whiskynavi@whiskynavi.com"
            required
            className="mt-2 bg-transparent border-0 border-b font-semibold typo-medium-13 border-gray-200 rounded-none px-0 py-3 text-white placeholder:text-gray-200 typo-medium-13 focus-visible:ring-0 focus-visible:border-white"
          />
        </div>

        {/* Password Input */}
        <div className="w-full mt-6">
          <Label
            htmlFor="password"
            className="text-white font-semibold typo-medium-13 block"
          >
            비밀번호
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="mt-2 bg-transparent border-0 border-b font-semibold typo-medium-13 border-gray-200 rounded-none px-0 py-3 text-white placeholder:text-gray-200 typo-medium-13 focus-visible:ring-0 focus-visible:border-white"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-red-400 text-sm text-center">
            이메일과 비밀번호를 확인해주세요.
          </p>
        )}

        {/* Login Button */}
        <Button
          type="submit"
          variant="outline"
          disabled={isPending}
          className="w-full h-14 mt-7 bg-white border border-white/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <p className="text-black font-semibold typo-medium-16">
            {isPending ? "로그인 중..." : "로그인"}
          </p>
        </Button>
      </form>

      {/* Sign Up & Find Password Links */}
      <div className="w-full flex items-center justify-center gap-14 mt-5">
        <Link
          href="/sign-up"
          className="w-25 text-center text-[#FFF] font-semibold typo-medium-16"
        >
          회원가입
        </Link>
        <span className="text-[#FFF]">|</span>
        <Link
          href="/find-password"
          className="w-25 text-center text-[#FFF] font-semibold typo-medium-16"
        >
          비밀번호 찾기
        </Link>
      </div>

      {/* Social Login Buttons */}
      <div className="w-full flex flex-col gap-3 mt-9">
        {/* Google Login */}
        <Button
          variant="outline"
          className="w-full h-14 bg-white border-0 rounded-[10px] relative"
        >
          <span className="absolute left-6.5">
            <IconGoogle size={24} />
          </span>
          <p className="text-black font-semibold typo-medium-16">
            구글로 로그인
          </p>
        </Button>

        {/* Naver Login */}
        <Button className="w-full h-14 bg-[#03C75A] border-0 rounded-[10px] relative">
          <span className="absolute left-4">
            <IconNaver size={44} />
          </span>
          <p className="text-[#FFF] font-semibold typo-medium-16">
            네이버로 로그인
          </p>
        </Button>

        {/* Kakao Login */}
        <Button className="w-full h-14 bg-[#FEE500] border-0 rounded-[10px] relative">
          <span className="absolute left-4">
            <IconKakao size={44} />
          </span>
          <p className="text-black font-semibold typo-medium-16">
            카카오로 로그인
          </p>
        </Button>
      </div>
    </>
  );
}
