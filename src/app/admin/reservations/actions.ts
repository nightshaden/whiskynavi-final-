"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  postApiAdminBottlesReservationsNotices,
  putApiAdminBottlesReservationsNoticesNoticeid,
  postApiAdminBottlesReservationsApplicationsApplicationidConfirm,
  postApiAdminBottlesReservationsApplicationsApplicationidReject,
  postApiAdminBottlesReservationsApplicationsApplicationidCancel,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { z } from "zod/v4";

export type FormState = { success: boolean; error?: string };

// ─── Zod 스키마 ──────────────────────────────────────────

const noticeFormSchema = z.object({
  bottleId: z
    .string()
    .transform((v) => {
      const n = Number(v);
      if (!v.trim() || Number.isNaN(n)) throw new Error("bottleId is required");
      return n;
    }),
  price: z
    .string()
    .transform((v) => {
      const n = Number(v);
      if (!v.trim() || Number.isNaN(n) || n < 0) throw new Error("price must be >= 0");
      return n;
    }),
  reservationStartAt: z.string().min(1, "예약 시작일은 필수입니다."),
  reservationEndAt: z.string().min(1, "예약 종료일은 필수입니다."),
  gradeConditions: z
    .string()
    .transform((v) => {
      if (!v.trim()) return undefined;
      try {
        return JSON.parse(v) as { applicableFrom: string; requiredRole: string }[];
      } catch {
        return undefined;
      }
    })
    .optional(),
});

function parseNoticeFormData(formData: FormData) {
  const raw: Record<string, string> = {};
  for (const key of Object.keys(noticeFormSchema.shape)) {
    raw[key] = (formData.get(key) as string) ?? "";
  }
  const result = noticeFormSchema.safeParse(raw);
  if (!result.success) {
    return { success: false as const, error: result.error.message };
  }

  const { reservationStartAt, reservationEndAt, gradeConditions } = result.data;
  if (gradeConditions?.length) {
    const start = new Date(reservationStartAt).getTime();
    const end = new Date(reservationEndAt).getTime();
    for (const gc of gradeConditions) {
      const t = new Date(gc.applicableFrom).getTime();
      if (t < start || t > end) {
        return {
          success: false as const,
          error: "등급 조건의 적용 시작일은 예약 기간 내에 있어야 합니다.",
        };
      }
    }
  }

  return { success: true as const, data: result.data };
}

// ─── Notice CRUD ──────────────────────────────────────────

export async function createNoticeFormAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  const parsed = parseNoticeFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error };

  const { bottleId, price, reservationStartAt, reservationEndAt, gradeConditions } = parsed.data;

  try {
    await postApiAdminBottlesReservationsNotices(
      {
        bottleId,
        price,
        reservationStartAt: new Date(reservationStartAt).toISOString(),
        reservationEndAt: new Date(reservationEndAt).toISOString(),
        gradeConditions: gradeConditions as any,
      },
      withToken(token),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "공고 생성에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/reservations");
  redirect("/admin/reservations");
}

export async function updateNoticeFormAction(
  noticeId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  const parsed = parseNoticeFormData(formData);
  if (!parsed.success) return { success: false, error: parsed.error };

  const { bottleId, price, reservationStartAt, reservationEndAt, gradeConditions } = parsed.data;

  try {
    await putApiAdminBottlesReservationsNoticesNoticeid(
      noticeId,
      {
        bottleId,
        price,
        reservationStartAt: new Date(reservationStartAt).toISOString(),
        reservationEndAt: new Date(reservationEndAt).toISOString(),
        gradeConditions: gradeConditions as any,
      },
      withToken(token),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "공고 수정에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/reservations");
  redirect(`/admin/reservations/${noticeId}`);
}

// ─── Application Actions ──────────────────────────────────

export async function confirmApplicationAction(applicationId: number, confirmedQuantity: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBottlesReservationsApplicationsApplicationidConfirm(
      applicationId,
      { confirmedQuantity },
      withToken(token),
    );
    revalidatePath("/admin/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "확정에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function rejectApplicationAction(applicationId: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBottlesReservationsApplicationsApplicationidReject(
      applicationId,
      withToken(token),
    );
    revalidatePath("/admin/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "거절에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function cancelApplicationAction(applicationId: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    await postApiAdminBottlesReservationsApplicationsApplicationidCancel(
      applicationId,
      withToken(token),
    );
    revalidatePath("/admin/reservations");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "취소에 실패했습니다.";
    return { success: false, error: message };
  }
}
