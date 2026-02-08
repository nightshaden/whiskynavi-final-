"use server";

import { revalidatePath } from "next/cache";
import type { AdminUserResponse, BlacklistRequest } from "@/apis/apis";

import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";

export async function searchUsersAction(name: string): Promise<{
  success: boolean;
  data?: AdminUserResponse[];
  error?: string;
}> {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    const response = await adminApi.getUsers({ name, pageSize: 10 }, { token });
    return { success: true, data: response.content };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사용자 검색에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function banUserAction(userId: number, data: BlacklistRequest) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    const res = await adminApi.banUser(userId, data, { token });
    revalidatePath("/admin/blacklist");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "블랙리스트 추가에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function editUserBanAction(
  userId: number,
  data: BlacklistRequest,
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    const res = await adminApi.editUserBan(userId, data, { token });
    revalidatePath("/admin/blacklist");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "블랙리스트 수정에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function cancelUserBanAction(userId: number) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.cancelUserBan(userId, { token });
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
