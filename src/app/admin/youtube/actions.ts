"use server";

import {
  postApiAdminKvStore,
  update as updateKvStore,
} from "@/apis/generated/api";
import { ApiError } from "@/apis/errors";
import { getUserErrorMessage } from "@/apis/errors";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { YOUTUBE_KEY } from "./constants";
import { toEmbedUrl } from "./utils";

export type FormState = { success: boolean; error?: string };

const schema = z.object({
  url: z
    .string()
    .url("올바른 URL을 입력해주세요.")
    .transform((url) => {
      const embedUrl = toEmbedUrl(url);
      if (!embedUrl) {
        throw new Error(
          "YouTube URL을 입력해주세요. (watch, embed, youtu.be, shorts 모두 가능)"
        );
      }
      return embedUrl;
    }),
});

export async function updateYoutubeAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  const parsed = schema.safeParse({
    url: formData.get("url"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const embedUrl = parsed.data.url;

  try {
    await updateKvStore(
      { key: YOUTUBE_KEY, value: embedUrl },
      withToken(token)
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      try {
        await postApiAdminKvStore(
          { key: YOUTUBE_KEY, value: embedUrl },
          withToken(token)
        );
      } catch (createError) {
        return {
          success: false,
          error: getUserErrorMessage(createError, "저장에 실패했습니다."),
        };
      }
    } else {
      return {
        success: false,
        error: getUserErrorMessage(error, "저장에 실패했습니다."),
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/youtube");
  return { success: true };
}
