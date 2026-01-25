"use server";

import { redirect } from "next/navigation";
import { api, type SignupRequest } from "@/apis/apis";
import { signUpSchema } from "./schemas";

export type SignUpState = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string;
    username?: string;
    password?: string;
    name?: string;
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
    birthDate: formData.get("birthDate") ?? "",
    gender: formData.get("gender") ?? "",
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
      } else if (field === "name") {
        fieldErrors.name = issue.message;
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
    privacyAgree: true,
    marketingAgree: data.marketingAgree === "true",
    emailAgree: data.emailAgree === "true",
    smsAgree: data.smsAgree === "true",
    snsAgree: data.snsAgree === "true",
  };

  // 선택 항목 추가
  if (data.birthDate) {
    signupData.birthDate = data.birthDate;
  }
  if (data.gender) {
    signupData.gender = data.gender;
  }

  try {
    await api.signUp(signupData);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원가입에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }

  // 회원가입 성공 시 로그인 페이지로 리다이렉트
  redirect("/sign-in");
}
