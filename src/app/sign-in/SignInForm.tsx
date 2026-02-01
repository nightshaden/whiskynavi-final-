"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconGoogle, IconKakao, IconNaver } from "@/icons";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 클라이언트 유효성 검사
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      setIsPending(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.");
      setIsPending(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleCredentialsSubmit} className="w-full">
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
          <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
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
          type="button"
          variant="outline"
          onClick={() => signIn("google", { callbackUrl: "/" })}
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
        <Button
          type="button"
          onClick={() => signIn("naver", { callbackUrl: "/" })}
          className="w-full h-14 bg-[#03C75A] border-0 rounded-[10px] relative"
        >
          <span className="absolute left-4">
            <IconNaver size={44} />
          </span>
          <p className="text-[#FFF] font-semibold typo-medium-16">
            네이버로 로그인
          </p>
        </Button>

        {/* Kakao Login */}
        <Button
          type="button"
          onClick={() => signIn("kakao", { callbackUrl: "/" })}
          className="w-full h-14 bg-[#FEE500] border-0 rounded-[10px] relative"
        >
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
