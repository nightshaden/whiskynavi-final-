"use server";

import { ApiError, getUserErrorMessage } from "@/apis/errors";
import { deleteApiAdminBottlesId, patchApiAdminBottlesId, postApiAdminBottles } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

function logActionError(label: string, error: unknown) {
  if (error instanceof ApiError) {
    console.error(`[${label}] ApiError`, {
      status: error.status,
      detail: error.detail,
      userMessage: error.userMessage,
    });
    return;
  }
  console.error(`[${label}] error`, error);
}

export type FormState = {
  success: boolean;
  error?: string;
  values?: Record<string, string>;
};

const FORM_FIELD_NAMES = [
  "name",
  "company",
  "brand",
  "series",
  "distillery",
  "maltType",
  "caskType",
  "caskNumber",
  "distillationDate",
  "bottledDate",
  "description",
  "extraInfos",
  "abv",
  "capacity",
  "stockQuantity",
  "supplyPrice",
  "consumerPrice",
] as const;

function extractFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of FORM_FIELD_NAMES) {
    const v = formData.get(key);
    if (typeof v === "string") values[key] = v;
  }
  return values;
}

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
  const values = extractFormValues(formData);

  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다.", values };
  }

  const parsed = parseBottleFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error, values };
  }

  if (!parsed.data.name) {
    return { success: false, error: "제품명은 필수입니다.", values };
  }

  const labelImg = formData.get("labelImg") as File | null;
  if (!labelImg || labelImg.size === 0) {
    return { success: false, error: "라벨 이미지는 필수입니다.", values };
  }

  try {
    await postApiAdminBottles({ labelImg }, { ...parsed.data, name: parsed.data.name }, withToken(token));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    logActionError("createBottleFormAction", error);
    return {
      success: false,
      error: getUserErrorMessage(error, "제품 생성에 실패했습니다."),
      values,
    };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateBottleFormAction(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = extractFormValues(formData);

  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다.", values };
  }

  const labelImg = formData.get("labelImg") as File | null;
  const hasImage = labelImg && labelImg.size > 0;

  const parsed = parseBottleFormData(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error, values };
  }

  try {
    await patchApiAdminBottlesId(id, { labelImg: hasImage ? labelImg : undefined }, parsed.data, withToken(token));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    logActionError("updateBottleFormAction", error);
    return {
      success: false,
      error: getUserErrorMessage(error, "제품 수정에 실패했습니다."),
      values,
    };
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
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      error: getUserErrorMessage(error, "제품 삭제에 실패했습니다."),
    };
  }
}
