"use server";

// 유효성 검사만 서버에서 처리
export type SignInState = {
  success: boolean;
  error?: string;
};

export async function validateSignInForm(
  email: string,
  password: string,
): Promise<SignInState> {
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

  return { success: true };
}
