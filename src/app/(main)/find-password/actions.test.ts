import { ApiError } from "@/apis/errors";
import {
  postApiAuthEmailVerificationResetSend,
  postApiAuthEmailVerificationResetVerify,
  postApiAuthResetPassword,
} from "@/apis/generated/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendResetCode, verifyAndResetPassword } from "./actions";

vi.mock("@/apis/generated/api", () => ({
  postApiAuthEmailVerificationResetSend: vi.fn(),
  postApiAuthEmailVerificationResetVerify: vi.fn(),
  postApiAuthResetPassword: vi.fn(),
}));

const mockedSend = vi.mocked(postApiAuthEmailVerificationResetSend);
const mockedVerify = vi.mocked(postApiAuthEmailVerificationResetVerify);
const mockedReset = vi.mocked(postApiAuthResetPassword);

describe("find-password actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is empty", async () => {
    await expect(sendResetCode("")).resolves.toEqual({
      success: false,
      error: "올바른 이메일 형식이 아닙니다.",
    });
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it("returns success when reset code send succeeds", async () => {
    mockedSend.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

    await expect(sendResetCode("user@example.com")).resolves.toEqual({ success: true });
    expect(mockedSend).toHaveBeenCalledWith({ email: "user@example.com" });
  });

  it("returns unknown-email message when backend rejects unregistered email", async () => {
    mockedSend.mockRejectedValue(new ApiError(404, '{"message":"가입되지 않은 이메일입니다"}'));

    await expect(sendResetCode("ghost@example.com")).resolves.toEqual({
      success: false,
      error: "가입되지 않은 이메일입니다",
    });
  });

  it("returns validation error when verification code is empty", async () => {
    await expect(verifyAndResetPassword("user@example.com", "")).resolves.toEqual({
      success: false,
      error: "인증 코드를 입력해주세요.",
    });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("verifies first and resets password second", async () => {
    mockedVerify.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });
    mockedReset.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

    await expect(verifyAndResetPassword("user@example.com", "123456")).resolves.toEqual({ success: true });

    expect(mockedVerify).toHaveBeenCalledWith({
      email: "user@example.com",
      code: "123456",
    });
    expect(mockedReset).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(mockedVerify.mock.invocationCallOrder[0]).toBeLessThan(mockedReset.mock.invocationCallOrder[0]);
  });

  it("does not reset password when verification fails", async () => {
    mockedVerify.mockRejectedValue(new ApiError(400, '{"message":"인증 코드가 올바르지 않습니다."}'));

    await expect(verifyAndResetPassword("user@example.com", "999999")).resolves.toEqual({
      success: false,
      error: "인증 코드가 올바르지 않습니다.",
    });
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it("returns reset fallback when verification succeeds but reset fails", async () => {
    mockedVerify.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });
    mockedReset.mockRejectedValue(new ApiError(500, '{"message":"temporary failure"}'));

    await expect(verifyAndResetPassword("user@example.com", "123456")).resolves.toEqual({
      success: false,
      error: "임시 비밀번호 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
