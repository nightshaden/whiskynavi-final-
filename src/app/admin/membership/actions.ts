"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { patchApiAdminUsersIdRolesAdd, patchApiAdminUsersIdRolesRemove } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";

const brandSchema = z.enum(["navi", "tales"], {
  message: "유효하지 않은 브랜드입니다.",
});

const membershipActionSchema = z.object({
  userId: z.number().positive("유효하지 않은 사용자입니다."),
  brand: brandSchema,
});

type MembershipBrand = z.infer<typeof brandSchema>;

const BRAND_ROLE_MAP = {
  navi: "ROLE_WHISKYNAVI_MEMBER",
  tales: "ROLE_WHISKYTALES_MEMBER",
} as const;

export async function addMembershipAction(userId: number, brand: MembershipBrand) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const parsed = membershipActionSchema.safeParse({ userId, brand });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const role = BRAND_ROLE_MAP[parsed.data.brand];

  try {
    await patchApiAdminUsersIdRolesAdd(parsed.data.userId, { roles: [role] }, withToken(token));
    revalidatePath("/admin/membership");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "멤버십 추가에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function removeMembershipAction(userId: number, brand: MembershipBrand) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const parsed = membershipActionSchema.safeParse({ userId, brand });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const role = BRAND_ROLE_MAP[parsed.data.brand];

  try {
    await patchApiAdminUsersIdRolesRemove(parsed.data.userId, { roles: [role] }, withToken(token));
    revalidatePath("/admin/membership");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "멤버십 삭제에 실패했습니다.";
    return { success: false, error: message };
  }
}
