"use server";

import { revalidatePath } from "next/cache";

import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";

export type BanUserData = {
  reason: string;
  startAt?: string;
  endAt?: string;
};

export async function banUserAction(userId: number, data: BanUserData) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.banUser(userId, data, { token });
    revalidatePath("/admin/blacklist");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "블랙리스트 추가에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function editUserBanAction(userId: number, data: BanUserData) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.editUserBan(userId, data, { token });
    revalidatePath("/admin/blacklist");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "블랙리스트 수정에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function cancelUserBanAction(userId: number) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.cancelUserBan(userId, { reason: "" }, { token });
    revalidatePath("/admin/blacklist");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "블랙리스트 해제에 실패했습니다.";
    return { success: false, error: message };
  }
}
