"use server";

import { revalidatePath } from "next/cache";

import { adminApi } from "@/apis/apis";
import { getAuthToken } from "@/lib/auth";

type MembershipBrand = "navi" | "tales";

const BRAND_ROLE_MAP = {
  navi: "ROLE_WHISKYNAVI_MEMBER",
  tales: "ROLE_WHISKYTALES_MEMBER",
} as const;

export async function addMembershipAction(
  userId: number,
  brand: MembershipBrand,
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const role = BRAND_ROLE_MAP[brand];

  try {
    await adminApi.addUserRoles(userId, [role], { token });
    revalidatePath("/admin/membership");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "멤버십 추가에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function removeMembershipAction(
  userId: number,
  brand: MembershipBrand,
) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const role = BRAND_ROLE_MAP[brand];

  try {
    await adminApi.removeUserRoles(userId, [role], { token });
    revalidatePath("/admin/membership");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "멤버십 삭제에 실패했습니다.";
    return { success: false, error: message };
  }
}
