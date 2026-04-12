"use server";

import { ApiError, getUserErrorMessage } from "@/apis/errors";
import type { SignupRequest } from "@/apis/generated/api";
import { postApiAuthSignup } from "@/apis/generated/api";
import { redirect } from "next/navigation";
import { signUpSchema } from "./schemas";

export type SignUpState = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string;
    username?: string;
    password?: string;
    nice?: string;
  };
};

export async function signUpAction(
  _prevState: SignUpState | null,
  formData: FormData,
): Promise<SignUpState> {
  // FormData를 객체로 변환
  const rawData = {
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
    name: formData.get("name") ?? "",
    username: formData.get("username") ?? "",
    phone: formData.get("phone") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    gender: formData.get("gender") ?? "",
    niceRequestNo: formData.get("niceRequestNo") ?? "",
    niceWebTransactionId: formData.get("niceWebTransactionId") ?? "",
    emailVerified: formData.get("emailVerified") ?? "",
    usernameVerified: formData.get("usernameVerified") ?? "",
    privacyAgree: formData.get("privacyAgree") ?? "",
    marketingAgree: formData.get("marketingAgree") ?? "",
    emailAgree: formData.get("emailAgree") ?? "",
    smsAgree: formData.get("smsAgree") ?? "",
    snsAgree: formData.get("snsAgree") ?? "",
  };

  // Zod 유효성 검사
  const result = signUpSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors: SignUpState["fieldErrors"] = {};
    let generalError: string | undefined;

    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;

      // 필드별 에러 매핑
      if (field === "email" || field === "emailVerified") {
        fieldErrors.email = issue.message;
      } else if (field === "username" || field === "usernameVerified") {
        fieldErrors.username = issue.message;
      } else if (field === "password" || field === "confirmPassword") {
        fieldErrors.password = issue.message;
      } else if (
        field === "name" ||
        field === "phone" ||
        field === "birthDate" ||
        field === "gender" ||
        field === "niceRequestNo" ||
        field === "niceWebTransactionId"
      ) {
        fieldErrors.nice = issue.message;
      } else if (field === "privacyAgree") {
        generalError = issue.message;
      }
    }

    return {
      success: false,
      error: generalError,
      fieldErrors:
        Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  const { data } = result;

  // API 요청 데이터 구성
  const signupData: SignupRequest = {
    email: data.email,
    password: data.password,
    name: data.name,
    username: data.username,
    phone: data.phone,
    birthDate: data.birthDate,
    gender: data.gender,
    niceRequestNo: data.niceRequestNo,
    niceWebTransactionId: data.niceWebTransactionId,
    privacyAgree: true,
    marketingAgree: data.marketingAgree === "true",
    emailAgree: data.emailAgree === "true",
    smsAgree: data.smsAgree === "true",
    snsAgree: data.snsAgree === "true",
  };

  try {
    await postApiAuthSignup(signupData);
  } catch (error) {
    // NICE 관련 400 에러는 별도 안내
    if (error instanceof ApiError && error.status === 400) {
      const msg = error.userMessage;
      if (
        msg.includes("본인인증") ||
        msg.includes("NICE") ||
        msg.includes("niceRequestNo")
      ) {
        return {
          success: false,
          error:
            "본인인증 정보가 만료되었거나 유효하지 않습니다. 다시 인증해주세요.",
        };
      }
    }

    return {
      success: false,
      error: getUserErrorMessage(error, "회원가입에 실패했습니다."),
    };
  }

  // 회원가입 성공 시 로그인 페이지로 리다이렉트
  redirect("/sign-in?registered=true");
}
