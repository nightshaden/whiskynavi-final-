import type { PostApiAuthSignupBody } from "@/apis/generated/api";

export type SignupAgreementField = keyof Pick<
  PostApiAuthSignupBody,
  "privacyAgree" | "marketingAgree" | "emailAgree" | "smsAgree" | "snsAgree"
>;

export const signupAgreementFieldNames = [
  "privacyAgree",
  "marketingAgree",
  "emailAgree",
  "smsAgree",
  "snsAgree",
] as const satisfies readonly SignupAgreementField[];

export type SignupAgreementFormValues = Record<SignupAgreementField, string>;
export type SignupAgreementBooleanValues = Required<Pick<PostApiAuthSignupBody, SignupAgreementField>>;
