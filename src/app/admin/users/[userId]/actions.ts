"use server";

import { revalidatePath } from "next/cache";
import type { AdminUserResponse } from "@/apis/apis";
import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";

export async function updateUserStatusAction(userId: number, user: AdminUserResponse) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.updateUserStatus(userId, user, { token });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "상태 변경에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function addUserRolesAction(userId: number, roles: string[]) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.addUserRoles(userId, roles, { token });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "권한 추가에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function removeUserRolesAction(userId: number, roles: string[]) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.removeUserRoles(userId, roles, { token });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "권한 제거에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function replaceUserRoleAction(
  userId: number,
  oldRole: string,
  newRole: string,
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await adminApi.removeUserRoles(userId, [oldRole], { token });
    await adminApi.addUserRoles(userId, [newRole], { token });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "권한 변경에 실패했습니다.";
    return { success: false, error: message };
  }
}
