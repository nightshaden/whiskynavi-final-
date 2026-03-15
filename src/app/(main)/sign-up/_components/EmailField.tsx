"use client";

import {
  postApiAuthCheckEmail,
  postApiAuthEmailVerificationSend,
  postApiAuthEmailVerificationVerify,
} from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef, useState, useTransition } from "react";
import { emailSchema } from "../schemas";

type VerificationStep = "input" | "code-sent" | "verified";

interface EmailFieldProps {
  onValidationChange: (verified: boolean) => void;
  error?: string;
}

export function EmailField({ onValidationChange, error }: EmailFieldProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<VerificationStep>("input");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const verifiedEmailRef = useRef("");

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setEmail(newValue);

      // 이메일 변경 시 인증 초기화
      if (step !== "input" && newValue !== verifiedEmailRef.current) {
        setStep("input");
        setCode("");
        onValidationChange(false);
        setLocalError(null);
      }
    },
    [step, onValidationChange],
  );

  // Step 1: 중복 확인 + 인증 코드 발송
  const handleSendCode = useCallback(() => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setLocalError(result.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      try {
        // 중복 확인
        const checkRes = await postApiAuthCheckEmail({ email });
        if (!checkRes.data.available) {
          setLocalError("이미 등록된 이메일입니다.");
          return;
        }

        // 인증 코드 발송
        await postApiAuthEmailVerificationSend({ email });
        setStep("code-sent");
        setLocalError(null);
      } catch {
        setLocalError("이메일 인증 코드 발송에 실패했습니다.");
      }
    });
  }, [email]);

  // Step 2: 인증 코드 검증
  const handleVerifyCode = useCallback(() => {
    if (!code.trim()) {
      setLocalError("인증 코드를 입력해주세요.");
      return;
    }

    startTransition(async () => {
      try {
        await postApiAuthEmailVerificationVerify({ email, code: code.trim() });
        setStep("verified");
        verifiedEmailRef.current = email;
        onValidationChange(true);
        setLocalError(null);
      } catch {
        setLocalError("인증 코드가 올바르지 않습니다.");
      }
    });
  }, [email, code, onValidationChange]);

  const isVerified = step === "verified";
  const displayError = error || localError;

  return (
    <div className="w-full">
      <Label
        htmlFor="email"
        className="typo-medium-14 block font-semibold text-black"
      >
        이메일
      </Label>

      {/* 이메일 입력 + 인증 버튼 */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            readOnly={isVerified}
            placeholder="ex) whiskynavi@whiskynavi.com"
            className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
          />
        </div>
        <Button
          type="button"
          onClick={handleSendCode}
          disabled={isPending || !email || step !== "input"}
          className="typo-medium-14 mb-px h-auto rounded-[10px] bg-[#1E2A38] px-5 py-2.5 text-white hover:bg-[#2a3a4d] disabled:opacity-50"
        >
          {isPending && step === "input"
            ? "발송 중..."
            : step === "input"
              ? "인증하기"
              : "발송완료"}
        </Button>
      </div>

      {/* 인증 코드 입력 (코드 발송 후 노출) */}
      {step === "code-sent" && (
        <div className="mt-3 flex items-end gap-3">
          <div className="flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증 코드 입력"
              className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
            />
          </div>
          <Button
            type="button"
            onClick={handleVerifyCode}
            disabled={isPending || !code.trim()}
            className="typo-medium-14 mb-px h-auto rounded-[10px] bg-[#1E2A38] px-5 py-2.5 text-white hover:bg-[#2a3a4d] disabled:opacity-50"
          >
            {isPending ? "확인 중..." : "확인"}
          </Button>
        </div>
      )}

      {displayError && (
        <p className="typo-regular-12 mt-2 text-red-500">* {displayError}</p>
      )}
      {step === "code-sent" && !displayError && (
        <p className="typo-regular-12 mt-2 text-blue-600">
          인증 코드가 발송되었습니다. 이메일을 확인해주세요.
        </p>
      )}
      {isVerified && !displayError && (
        <p className="typo-regular-12 mt-2 text-green-600">
          ✓ 이메일 인증이 완료되었습니다.
        </p>
      )}

      <input type="hidden" name="emailVerified" value={String(isVerified)} />
    </div>
  );
}
