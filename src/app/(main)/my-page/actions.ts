"use server";

import {
  patchApiOrdersOrderidCancel,
  putApiAuthChangePassword,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await putApiAuthChangePassword(
      {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
      withToken(token),
    );

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message =
      error instanceof Error
        ? error.message
        : "비밀번호 변경에 실패했습니다.";
    return { success: false, error: message };
  }
}

const cancelOrderSchema = z.object({
  orderId: z.number().positive(),
  reason: z.string().max(500).optional(),
});

export async function cancelOrder(
  orderId: number,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const parsed = cancelOrderSchema.safeParse({ orderId, reason });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await patchApiOrdersOrderidCancel(
      parsed.data.orderId,
      { reason: parsed.data.reason },
      withToken(token),
    );

    revalidatePath("/my-page");
    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message =
      error instanceof Error
        ? error.message
        : "주문 취소에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function updateProfile(
  _prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  // 프로필 수정 API가 아직 없으므로 stub
  return { success: false, error: "프로필 수정 기능은 준비 중입니다." };
}
