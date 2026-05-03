import type { SignupAgreementBooleanValues } from "./agreement-fields";

export interface VerifiedSignupProfile {
  niceRequestNo: string;
  niceWebTransactionId: string;
  name: string;
  phone: string;
  birthDate: string;
  gender: "M" | "F" | "N";
}

export interface SignupFormState {
  username: string;
  email: string;
  password: string;
  privacyAgree: SignupAgreementBooleanValues["privacyAgree"];
  marketingAgree: SignupAgreementBooleanValues["marketingAgree"];
  smsAgree: SignupAgreementBooleanValues["smsAgree"];
  snsAgree: SignupAgreementBooleanValues["snsAgree"];
  emailAgree: SignupAgreementBooleanValues["emailAgree"];
}

export function toIsoBirthDate(value: string) {
  if (!/^\d{8}$/.test(value)) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

export function toSignupGender(value: string): "M" | "F" | "N" {
  if (value === "1") return "M";
  if (value === "0") return "F";
  return "N";
}

export function maskPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function formatGenderLabel(value: VerifiedSignupProfile["gender"]) {
  if (value === "M") return "남성";
  if (value === "F") return "여성";
  return "미정";
}

// --- 개발 환경 bypass ---

export const IS_DEV_BYPASS_ENABLED = process.env.NODE_ENV === "development";

export const DEV_MOCK_PROFILE: VerifiedSignupProfile = {
  niceRequestNo: "dev-mock-request",
  niceWebTransactionId: "dev-mock-transaction",
  name: "테스트유저",
  phone: "01012345678",
  birthDate: "1990-01-01",
  gender: "M",
};

export function getNiceChannelName(sessionId: string) {
  return `nice-verification-${sessionId}`;
}

// --- 중복 계정 감지 ---

export interface DuplicateAccountInfo {
  existingAuthType: string;
}

export type { NiceVerificationSuccessMessage } from "@/types/auth";

export type NiceMessage =
  | import("@/types/auth").NiceVerificationSuccessMessage
  | {
      type: "nice-verification-error";
      error?: string;
    }
  | {
      type: "nice-verification-close";
    };
