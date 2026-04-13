"use server";

import { deleteApiAdminBottlesId, patchApiAdminBottlesId, postApiAdminBottles } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

export type FormState = { success: boolean; error?: string };

const optionalText = z
  .string()
  .transform((v) => v.trim() || undefined)
  .optional();

const optionalNum = z
  .string()
  .transform((v) => {
    const n = Number(v);
    return v.trim() && !Number.isNaN(n) ? n : undefined;
  })
  .optional();

const bottleFormSchema = z.object({
  name: optionalText,
  company: optionalText,
  brand: optionalText,
  series: optionalText,
  distillery: optionalText,
  maltType: optionalText,
  caskType: optionalText,
  caskNumber: optionalText,
  distillationDate: optionalText,
  bottledDate: optionalText,
  description: optionalText,
  extraInfos: optionalText,
  abv: optionalNum,
  capacity: optionalNum,
  stockQuantity: optionalNum,
  supplyPrice: optionalNum,
  consumerPrice: optionalNum,
});

function parseBottleFormData(formData: FormData) {
  const raw: Record<string, string> = {};
  for (const key of Object.keys(bottleFormSchema.shape)) {
    raw[key] = (formData.get(key) as string) ?? "";
  }
  const result = bottleFormSchema.safeParse(raw);
  if (!result.success) {
    return { success: false as const, error: result.error.message };
  }
  return { success: true as const, data: result.data };
}

export async function createBottleFormAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const parsed = parseBottleFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  if (!parsed.data.name) {
    return { success: false, error: "제품명은 필수입니다." };
  }

  const labelImg = formData.get("labelImg") as File | null;
  if (!labelImg || labelImg.size === 0) {
    return { success: false, error: "라벨 이미지는 필수입니다." };
  }

  try {
    await postApiAdminBottles({ labelImg }, { ...parsed.data, name: parsed.data.name }, withToken(token));
  } catch (error) {
    const message = error instanceof Error ? error.message : "제품 생성에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateBottleFormAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const labelImg = formData.get("labelImg") as File | null;
  const hasImage = labelImg && labelImg.size > 0;

  const parsed = parseBottleFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  try {
    await patchApiAdminBottlesId(id, { labelImg: hasImage ? labelImg : undefined }, parsed.data, withToken(token));
  } catch (error) {
    const message = error instanceof Error ? error.message : "제품 수정에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}`);
}

export async function deleteBottleAction(id: number) {
  const token = await getAuthToken();

  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  try {
    await deleteApiAdminBottlesId(id, withToken(token));
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "제품 삭제에 실패했습니다.";
    return { success: false, error: message };
  }
}
