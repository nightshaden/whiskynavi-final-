"use server";

import {
  deleteApiAdminUsersId,
  patchApiAdminUsersIdRolesAdd,
  patchApiAdminUsersIdRolesRemove,
  patchApiAdminUsersIdStatus,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId: number) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await deleteApiAdminUsersId(userId, withToken(token));
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원 삭제에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function updateUserStatusAction(userId: number, status: string) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await patchApiAdminUsersIdStatus(userId, { status }, withToken(token));
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
    await patchApiAdminUsersIdRolesAdd(userId, { roles }, withToken(token));
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
    await patchApiAdminUsersIdRolesRemove(userId, { roles }, withToken(token));
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
    await patchApiAdminUsersIdRolesRemove(
      userId,
      { roles: [oldRole] },
      withToken(token),
    );
    await patchApiAdminUsersIdRolesAdd(
      userId,
      { roles: [newRole] },
      withToken(token),
    );
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "권한 변경에 실패했습니다.";
    return { success: false, error: message };
  }
}
