"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { AdminUserResponse } from "@/apis/apis";
import {
  getApiAdminUsers,
  patchApiAdminUsersIdBan,
  patchApiAdminUsersIdBanUpdate,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";

const blacklistSchema = z.object({
  reason: z.string().min(1, "사유를 입력해주세요."),
  startAt: z.string().min(1, "시작일은 필수입니다."),
  endAt: z.string().nullable(),
});

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
    const res = await getApiAdminUsers(
      { filters: { name, pageSize: 10 } },
      withToken(token),
    );
    return { success: true, data: res.data.content as AdminUserResponse[] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사용자 검색에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function banUserAction(
  userId: number,
  data: { reason: string; startAt: string; endAt: string | null },
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const parsed = blacklistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await patchApiAdminUsersIdBan(
      userId,
      {
        reason: parsed.data.reason,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt ?? undefined,
      },
      withToken(token),
    );
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
  data: { reason: string; startAt: string; endAt: string | null },
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const parsed = blacklistSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await patchApiAdminUsersIdBanUpdate(
      userId,
      {
        reason: parsed.data.reason,
        startAt: parsed.data.startAt,
        endAt: parsed.data.endAt ?? undefined,
      },
      withToken(token),
    );
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
    await patchApiAdminUsersIdBanUpdate(
      userId,
      { endAt: "2000-01-01T00:00:00", reason: "제재 해제" },
      withToken(token),
    );
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
