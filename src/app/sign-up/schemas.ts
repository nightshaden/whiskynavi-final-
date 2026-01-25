import { z } from "zod";

export const emailSchema = z
  .email("올바른 이메일 형식이 아닙니다.")
  .min(1, "이메일을 입력해주세요.")
  .max(100, "이메일은 100자 이하여야 합니다.");

export const usernameSchema = z
  .string()
  .min(3, "닉네임은 3자 이상이어야 합니다.")
  .max(50, "닉네임은 50자 이하여야 합니다.");

export const passwordSchema = z
  .string()
  .min(6, "비밀번호는 6자 이상이어야 합니다.")
  .max(100, "비밀번호는 100자 이하여야 합니다.");

export const nameSchema = z
  .string()
  .min(1, "이름을 입력해주세요.")
  .max(100, "이름은 100자 이하여야 합니다.");

// 회원가입 폼 전체 스키마
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    name: nameSchema,
    username: usernameSchema,
    birthDate: z.string().optional(),
    gender: z.string().optional(),
    emailVerified: z.literal("true", {
      message: "이메일 중복 확인이 필요합니다.",
    }),
    usernameVerified: z.literal("true", {
      message: "닉네임 중복 확인이 필요합니다.",
    }),
    privacyAgree: z.literal("true", {
      message: "필수 약관에 동의해주세요.",
    }),
    marketingAgree: z.string(),
    emailAgree: z.string(),
    smsAgree: z.string(),
    snsAgree: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["password"],
  });
