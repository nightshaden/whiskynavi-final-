"use server";

import { redirect } from "next/navigation";
import { api } from "@/apis/apis";

export type SignInState = {
  success: boolean;
  error?: string;
};

export async function signInAction(
  _prevState: SignInState | null,
  formData: FormData,
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 기본 유효성 검사
  if (!email || !password) {
    return {
      success: false,
      error: "이메일과 비밀번호를 모두 입력해주세요.",
    };
  }

  // 이메일 형식 유효성 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "올바른 이메일 형식이 아닙니다.",
    };
  }

  try {
    await api.signIn({ email, password });

    // 로그인 성공 시 메인 페이지로 리다이렉트
    // redirect()는 try 블록 밖에서 호출해야 합니다
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "로그인에 실패했습니다.";
    return {
      success: false,
      error: message,
    };
  }

  redirect("/");
}
