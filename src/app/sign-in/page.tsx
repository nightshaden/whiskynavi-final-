import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconGoogle, IconKakao, IconNaver } from "@/icons";

const Page = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <section className="flex flex-col items-center w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/whiskynavi-logo.png"
            alt="whiskynavi-logo"
            width={80}
            height={101}
          />
        </div>

        {/* Email Input */}
        <div className="w-full mt-6">
          <Label className="text-white font-semibold typo-medium-13 block">
            이메일 주소
          </Label>
          <Input
            type="email"
            placeholder="ex) whiskynavi@whiskynavi.com"
            className="mt-2 bg-transparent border-0 border-b font-semibold typo-medium-13 border-gray-200 rounded-none px-0 py-3 text-white placeholder:text-gray-200  typo-medium-13 focus-visible:ring-0 focus-visible:border-white"
          />
        </div>

        {/* Password Input */}
        <div className="w-full mt-6">
          <Label className="text-white font-semibold typo-medium-13 block">
            비밀번호
          </Label>
          <Input
            type="password"
            className="mt-2 bg-transparent border-0 border-b font-semibold typo-medium-13 border-gray-200 rounded-none px-0 py-3 text-white placeholder:text-gray-200  typo-medium-13 focus-visible:ring-0 focus-visible:border-white"
          />
        </div>

        {/* Login Button */}
        <Button
          variant="outline"
          className="w-full h-14 mt-7 bg-white border border-white/30 cursor-pointer"
        >
          <p className="text-black font-semibold typo-medium-16">로그인</p>
        </Button>

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
            <p className="text-[#FFFFF] font-semibold typo-medium-16">
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
      </section>
    </main>
  );
};

export default Page;
