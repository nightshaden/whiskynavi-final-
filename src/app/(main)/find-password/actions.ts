"use server";

import { getUserErrorMessage } from "@/apis/errors";
import {
  postApiAuthEmailVerificationResetSend,
  postApiAuthEmailVerificationResetVerify,
  postApiAuthResetPassword,
} from "@/apis/generated/api";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import { emailSchema } from "../sign-up/schemas";

export type FindPasswordActionResult = {
  success: boolean;
  error?: string;
};

const sendResetCodeSchema = z.object({
  email: emailSchema,
});

const verifyAndResetSchema = z.object({
  email: emailSchema,
  code: z.string().trim().min(1, "인증 코드를 입력해주세요."),
});

const UNKNOWN_EMAIL_MESSAGE = "가입되지 않은 이메일입니다";

function normalizeFindPasswordError(error: unknown, fallback: string): string {
  const message = getUserErrorMessage(error, fallback);

  if (message.includes("가입되지 않은 이메일")) {
    return UNKNOWN_EMAIL_MESSAGE;
  }

  return message;
}

export async function sendResetCode(email: string): Promise<FindPasswordActionResult> {
  try {
    const parsed = sendResetCodeSchema.safeParse({ email });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "올바른 이메일 형식이 아닙니다.",
      };
    }

    await postApiAuthEmailVerificationResetSend({ email: parsed.data.email });

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      error: normalizeFindPasswordError(error, "인증 코드 발송에 실패했습니다."),
    };
  }
}

export async function verifyAndResetPassword(email: string, code: string): Promise<FindPasswordActionResult> {
  try {
    const parsed = verifyAndResetSchema.safeParse({ email, code });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "인증 코드를 입력해주세요.",
      };
    }

    await postApiAuthEmailVerificationResetVerify({
      email: parsed.data.email,
      code: parsed.data.code,
    });

    try {
      await postApiAuthResetPassword({ email: parsed.data.email });
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      return {
        success: false,
        error: "임시 비밀번호 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
    }

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      error: normalizeFindPasswordError(error, "인증 코드가 올바르지 않습니다."),
    };
  }
}
