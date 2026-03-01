"use client";

import { api } from "@/apis/apis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef, useState, useTransition } from "react";
import { emailSchema } from "../schemas";

interface EmailFieldProps {
  onValidationChange: (verified: boolean) => void;
  error?: string;
}

export function EmailField({ onValidationChange, error }: EmailFieldProps) {
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const verifiedValueRef = useRef<string>("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // 입력값 변경 시 검증 상태 무효화
      if (isVerified && newValue !== verifiedValueRef.current) {
        setIsVerified(false);
        onValidationChange(false);
        setLocalError(null);
      }
    },
    [isVerified, onValidationChange],
  );

  const handleVerify = useCallback(() => {
    // Zod 이메일 형식 검사
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      setLocalError(result.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      try {
        const result = await api.checkEmail(value);

        if (result.available) {
          setIsVerified(true);
          verifiedValueRef.current = value;
          onValidationChange(true);
          setLocalError(null);
        } else {
          setIsVerified(false);
          onValidationChange(false);
          setLocalError("이미 등록된 이메일입니다.");
        }
      } catch {
        setLocalError("이메일 확인 중 오류가 발생했습니다.");
        setIsVerified(false);
        onValidationChange(false);
      }
    });
  }, [value, onValidationChange]);

  const displayError = error || localError;

  return (
    <div className="w-full">
      <Label
        htmlFor="email"
        className="typo-medium-14 block font-semibold text-black"
      >
        이메일
      </Label>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="email"
            name="email"
            type="email"
            value={value}
            onChange={handleChange}
            placeholder="ex) whiskynavi@whiskynavi.com"
            className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
          />
        </div>
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isPending || !value || isVerified}
          className="typo-medium-14 mb-px h-auto rounded-[10px] bg-[#1E2A38] px-5 py-2.5 text-white hover:bg-[#2a3a4d] disabled:opacity-50"
        >
          {isPending ? "확인 중..." : isVerified ? "확인완료" : "인증하기"}
        </Button>
      </div>
      {displayError && (
        <p className="typo-regular-12 mt-2 text-red-500">* {displayError}</p>
      )}
      {isVerified && !displayError && (
        <p className="typo-regular-12 mt-2 text-green-600">
          ✓ 사용 가능한 이메일입니다.
        </p>
      )}
      {/* Hidden input for form submission */}
      <input type="hidden" name="emailVerified" value={String(isVerified)} />
    </div>
  );
}
