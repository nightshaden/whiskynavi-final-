import Image from "next/image";
import FindPasswordForm from "./_components/FindPasswordForm";

export default function FindPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="flex w-full max-w-[400px] flex-col items-center">
        <div className="flex flex-col items-center">
          <Image src="/whiskynavi-logo.png" alt="whiskynavi-logo" width={80} height={101} />
        </div>

        <div className="mt-6 w-full text-center text-white">
          <h1 className="typo-medium-20 font-semibold">비밀번호 초기화</h1>
          <p className="typo-medium-13 mt-2 text-gray-200">
            가입한 이메일로 인증코드를 발송한 뒤 임시 비밀번호를 보내드립니다.
          </p>
        </div>

        <FindPasswordForm />
      </section>
    </main>
  );
}
