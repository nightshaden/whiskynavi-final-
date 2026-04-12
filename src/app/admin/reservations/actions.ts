"use server";

import {
  type PostApiAdminBottlesReservationsNoticesBodyGradeConditionsItem,
  getApiAdminBottles,
  postApiAdminBottlesReservationsApplicationsApplicationidCancel,
  postApiAdminBottlesReservationsApplicationsApplicationidConfirm,
  postApiAdminBottlesReservationsApplicationsApplicationidReject,
  postApiAdminBottlesReservationsNotices,
  putApiAdminBottlesReservationsNoticesNoticeid,
} from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

export type FormState = { success: boolean; error?: string };

// ─── Zod 스키마 ──────────────────────────────────────────

const optionalPositiveInt = (fieldName: string) =>
  z.string().transform((v): number | undefined => {
    if (!v.trim()) return undefined;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || !Number.isInteger(n))
      throw new Error(`${fieldName}은(는) 0 이상의 정수여야 합니다.`);
    return n;
  });

const noticeFormSchema = z.object({
  bottleId: z.string().transform((v) => {
    const n = Number(v);
    if (!v.trim() || Number.isNaN(n)) throw new Error("bottleId is required");
    return n;
  }),
  price: z.string().transform((v) => {
    const n = Number(v);
    if (!v.trim() || Number.isNaN(n) || n < 0)
      throw new Error("price must be >= 0");
    return n;
  }),
  availableQuantity: optionalPositiveInt("예약 받을 병수"),
  maxOrderQuantity: optionalPositiveInt("인당 최대 예약 가능 병수"),
  reservationStartAt: z.string().min(1, "예약 시작일은 필수입니다."),
  reservationEndAt: z.string().min(1, "예약 종료일은 필수입니다."),
  gradeConditions: z.string().transform((v) => {
    if (!v.trim()) return undefined;
    try {
      return JSON.parse(v) as {
        applicableFrom: string;
        requiredRole: string;
      }[];
    } catch {
      throw new Error("등급 조건의 형식이 올바르지 않습니다.");
    }
  }),
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

  const {
    reservationStartAt,
    reservationEndAt,
    gradeConditions,
    availableQuantity,
    maxOrderQuantity,
  } = result.data;

  const start = new Date(reservationStartAt).getTime();
  const end = new Date(reservationEndAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return {
      success: false as const,
      error: "예약 시작일 또는 종료일이 유효하지 않습니다.",
    };
  }

  if (
    availableQuantity != null &&
    maxOrderQuantity != null &&
    maxOrderQuantity > availableQuantity
  ) {
    return {
      success: false as const,
      error: "인당 최대 예약 병수는 전체 예약 받을 병수를 초과할 수 없습니다.",
    };
  }

  if (gradeConditions?.length) {
    for (const gc of gradeConditions) {
      const t = new Date(gc.applicableFrom).getTime();
      if (Number.isNaN(t) || t < start || t > end) {
        return {
          success: false as const,
          error: "등급 조건의 적용 시작일은 예약 기간 내에 있어야 합니다.",
        };
      }
    }
  }

  return { success: true as const, data: result.data };
}

function buildNoticeBody(data: z.infer<typeof noticeFormSchema>) {
  return {
    bottleId: data.bottleId,
    price: data.price,
    reservationStartAt: new Date(data.reservationStartAt).toISOString(),
    reservationEndAt: new Date(data.reservationEndAt).toISOString(),
    gradeConditions:
      data.gradeConditions as PostApiAdminBottlesReservationsNoticesBodyGradeConditionsItem[],
    availableQuantity: data.availableQuantity,
    maxOrderQuantity: data.maxOrderQuantity,
  };
}

// ─── Bottle Search ───────────────────────────────────────

export interface BottleOption {
  id: number;
  name: string;
  stockQuantity: number | null;
}

export type SearchBottlesResult =
  | { success: true; data: BottleOption[] }
  | { success: false; error: string };

export async function searchBottlesAction(
  keyword: string,
): Promise<SearchBottlesResult> {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "인증이 필요합니다." };

  try {
    const trimmed = keyword.trim().slice(0, 100);
    const res = await getApiAdminBottles(
      {
        filters: {
          reservationStatus: "NO_RESERVATION",
          keyword: trimmed || undefined,
          pageSize: 20,
        },
      },
      withToken(token),
    );
    const data: BottleOption[] =
      res.data.content
        ?.filter(
          (b): b is typeof b & { id: number; name: string } =>
            b.id != null && b.name != null,
        )
        .map((b) => ({
          id: b.id,
          name: b.name,
          stockQuantity: b.stockQuantity ?? null,
        })) ?? [];
    return { success: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "제품 검색에 실패했습니다.";
    return { success: false, error: message };
  }
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

  try {
    await postApiAdminBottlesReservationsNotices(
      buildNoticeBody(parsed.data),
      withToken(token),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "공고 생성에 실패했습니다.";
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

  try {
    await putApiAdminBottlesReservationsNoticesNoticeid(
      noticeId,
      buildNoticeBody(parsed.data),
      withToken(token),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "공고 수정에 실패했습니다.";
    return { success: false, error: message };
  }

  revalidatePath("/admin/reservations");
  redirect(`/admin/reservations/${noticeId}`);
}

// ─── Application Actions ──────────────────────────────────

export async function confirmApplicationAction(
  applicationId: number,
  confirmedQuantity: number,
) {
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
    const message =
      error instanceof Error ? error.message : "확정에 실패했습니다.";
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
    const message =
      error instanceof Error ? error.message : "거절에 실패했습니다.";
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
    const message =
      error instanceof Error ? error.message : "취소에 실패했습니다.";
    return { success: false, error: message };
  }
}
