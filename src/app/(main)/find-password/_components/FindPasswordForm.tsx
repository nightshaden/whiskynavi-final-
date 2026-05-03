"use client";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { sendResetCode, verifyAndResetPassword } from "../actions";

type FindPasswordStep = "idle" | "code-sent" | "resetting" | "completed";

export default function FindPasswordForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<FindPasswordStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextEmail = e.target.value;
      setEmail(nextEmail);

      if (step === "code-sent" || step === "resetting") {
        setStep("idle");
        setCode("");
        setError(null);
      }
    },
    [step],
  );

  const handleSendCode = useCallback(() => {
    setError(null);

    startTransition(async () => {
      const result = await sendResetCode(email.trim());

      if (!result.success) {
        setStep("idle");
        setError(result.error ?? "인증 코드 발송에 실패했습니다.");
        return;
      }

      setStep("code-sent");
      setCode("");
    });
  }, [email]);

  const handleVerifyCode = useCallback(() => {
    setError(null);
    setStep("resetting");

    startTransition(async () => {
      const result = await verifyAndResetPassword(email.trim(), code.trim());

      if (!result.success) {
        setStep("code-sent");
        setError(result.error ?? "인증 코드가 올바르지 않습니다.");
        return;
      }

      setStep("completed");
    });
  }, [email, code]);

  if (step === "completed") {
    return (
      <div className="mt-6 w-full">
        <FormMessage
          message="임시 비밀번호를 이메일로 발송했습니다."
          variant="success"
          className="text-center"
        />
        <Link
          href="/sign-in"
          className="typo-medium-16 mt-6 block w-full text-center font-semibold text-white underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full">
      <div className="space-y-6">
        <div>
          <Label htmlFor="email" className="typo-medium-13 block font-semibold text-white">
            이메일 주소
          </Label>
          <div className="mt-2 flex items-end gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              readOnly={isPending || step === "resetting"}
              placeholder="ex) whiskynavi@whiskynavi.com"
              className="typo-medium-13 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 font-semibold text-white placeholder:text-gray-200 focus-visible:border-white focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={isPending || step === "code-sent" || step === "resetting"}
              className="shrink-0 border border-white/30 bg-white text-black disabled:opacity-50"
            >
              {isPending && step === "idle" ? "발송 중..." : step === "code-sent" ? "발송완료" : "인증코드 발송"}
            </Button>
          </div>
        </div>

        {(step === "code-sent" || step === "resetting") && (
          <div>
            <Label htmlFor="verification-code" className="typo-medium-13 block font-semibold text-white">
              인증 코드
            </Label>
            <div className="mt-2 flex items-end gap-2">
              <Input
                id="verification-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                readOnly={step === "resetting"}
                placeholder="인증 코드 입력"
                className="typo-medium-13 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 font-semibold text-white placeholder:text-gray-200 focus-visible:border-white focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVerifyCode}
                disabled={isPending || !code.trim()}
                className="shrink-0 border border-white/30 bg-white text-black disabled:opacity-50"
              >
                {step === "resetting" ? "처리 중..." : "확인"}
              </Button>
            </div>
            {step === "code-sent" && !error && (
              <FormMessage
                message="인증 코드가 발송되었습니다. 이메일을 확인해주세요."
                variant="info"
                className="mt-2"
              />
            )}
          </div>
        )}

        <FormMessage message={error ?? undefined} className="mt-2" />
      </div>
    </div>
  );
}
