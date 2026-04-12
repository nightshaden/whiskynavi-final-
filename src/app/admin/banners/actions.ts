"use server";

import {
  patchApiAdminBannersId,
  postApiAdminBanners,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

export type FormState = { success: boolean; error?: string };

/** 파일명을 짧게 정규화하여 DB 컬럼 길이 초과 방지 */
function shortenFile(file: File): File {
  const ext = file.name.split(".").pop() ?? "img";
  const short = `banner_${Date.now()}.${ext}`;
  return new File([file], short, { type: file.type });
}

const bannerFormSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  description: z
    .string()
    .transform((v) => v.trim() || undefined)
    .optional(),
  link: z
    .string()
    .transform((v) => v.trim() || undefined)
    .optional(),
});

export async function createBannerFormAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const raw = {
    title: (formData.get("title") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    link: (formData.get("link") as string) ?? "",
  };

  const parsed = bannerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const backgroundImg = formData.get("backgroundImg") as File | null;
  if (!backgroundImg || backgroundImg.size === 0) {
    return { success: false, error: "배경 이미지는 필수입니다." };
  }

  const mainImg = formData.get("mainImg") as File | null;
  if (!mainImg || mainImg.size === 0) {
    return { success: false, error: "메인 이미지는 필수입니다." };
  }

  try {
    await postApiAdminBanners(
      {
        backgroundImg: shortenFile(backgroundImg),
        mainImg: shortenFile(mainImg),
      },
      {
        title: parsed.data.title,
        description: parsed.data.description,
        link: parsed.data.link,
      },
      withToken(token),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "배너 생성에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBannerFormAction(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "인증이 필요합니다." };
  }

  const raw = {
    title: (formData.get("title") as string) ?? "",
    description: (formData.get("description") as string) ?? "",
    link: (formData.get("link") as string) ?? "",
  };

  const parsed = bannerFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const backgroundImg = formData.get("backgroundImg") as File | null;
  const hasBackground = backgroundImg && backgroundImg.size > 0;

  const mainImg = formData.get("mainImg") as File | null;
  const hasMain = mainImg && mainImg.size > 0;

  try {
    await patchApiAdminBannersId(
      id,
      {
        backgroundImg: hasBackground ? shortenFile(backgroundImg) : undefined,
        mainImg: hasMain ? shortenFile(mainImg) : undefined,
      },
      {
        title: parsed.data.title,
        description: parsed.data.description,
        link: parsed.data.link,
      },
      withToken(token),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "배너 수정에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/banners");
  redirect(`/admin/banners/${id}`);
}
