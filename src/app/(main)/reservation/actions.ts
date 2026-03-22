"use server";

import { postApiBottlesReservationsNoticesNoticeidApplications } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function applyReservation(
  noticeId: number,
  quantity: number,
  userBusinessId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (quantity < 1 || quantity > 10) {
      return { success: false, error: "수량은 1~10병 사이로 입력해주세요." };
    }

    await postApiBottlesReservationsNoticesNoticeidApplications(
      noticeId,
      { quantity, userBusinessId },
      withToken(token),
    );

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message =
      error instanceof Error ? error.message : "예약 신청에 실패했습니다.";
    return { success: false, error: message };
  }
}
