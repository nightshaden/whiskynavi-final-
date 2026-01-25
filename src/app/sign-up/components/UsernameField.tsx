"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/apis/apis";
import { usernameSchema } from "../schemas";

interface UsernameFieldProps {
  onValidationChange: (verified: boolean) => void;
  error?: string;
}

export function UsernameField({ onValidationChange, error }: UsernameFieldProps) {
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
    // Zod 닉네임 유효성 검사
    const result = usernameSchema.safeParse(value);
    if (!result.success) {
      setLocalError(result.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      try {
        const result = await api.checkUsername(value);

        if (result.available) {
          setIsVerified(true);
          verifiedValueRef.current = value;
          onValidationChange(true);
          setLocalError(null);
        } else {
          setIsVerified(false);
          onValidationChange(false);
          setLocalError("해당 닉네임은 사용할 수 없습니다.");
        }
      } catch {
        setLocalError("닉네임 확인 중 오류가 발생했습니다.");
        setIsVerified(false);
        onValidationChange(false);
      }
    });
  }, [value, onValidationChange]);

  const displayError = error || localError;

  return (
    <div className="w-full">
      <Label
        htmlFor="username"
        className="text-black font-semibold typo-medium-14 block"
      >
        닉네임
      </Label>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            id="username"
            name="username"
            type="text"
            value={value}
            onChange={handleChange}
            className="bg-transparent border-0 border-b border-gray-200 rounded-none px-0 py-3 text-black placeholder:text-gray-400 typo-regular-14 focus-visible:ring-0 focus-visible:border-black"
          />
        </div>
        <Button
          type="button"
          onClick={handleVerify}
          disabled={isPending || !value || isVerified}
          className="px-5 py-2.5 h-auto bg-[#1E2A38] text-white typo-medium-14 rounded-[10px] hover:bg-[#2a3a4d] mb-px disabled:opacity-50"
        >
          {isPending ? "확인 중..." : isVerified ? "확인완료" : "중복확인"}
        </Button>
      </div>
      {displayError && (
        <p className="mt-2 text-red-500 typo-regular-12">* {displayError}</p>
      )}
      {isVerified && !displayError && (
        <p className="mt-2 text-green-600 typo-regular-12">
          ✓ 사용 가능한 닉네임입니다.
        </p>
      )}
      {/* Hidden input for form submission */}
      <input type="hidden" name="usernameVerified" value={String(isVerified)} />
    </div>
  );
}
