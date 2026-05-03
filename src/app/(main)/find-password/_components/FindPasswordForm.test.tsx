import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { sendResetCode, verifyAndResetPassword } from "../actions";
import FindPasswordForm from "./FindPasswordForm";

const { mockSendResetCode, mockVerifyAndResetPassword } = vi.hoisted(() => ({
  mockSendResetCode: vi.fn<typeof sendResetCode>(),
  mockVerifyAndResetPassword: vi.fn<typeof verifyAndResetPassword>(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("../actions", () => ({
  sendResetCode: mockSendResetCode,
  verifyAndResetPassword: mockVerifyAndResetPassword,
}));

describe("FindPasswordForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reveals verification input after send succeeds", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));

    expect(await screen.findByPlaceholderText("인증 코드 입력")).toBeInTheDocument();
    expect(screen.getByText("인증 코드가 발송되었습니다. 이메일을 확인해주세요.")).toBeInTheDocument();
  });

  it("shows backend error when email is not registered", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({
      success: false,
      error: "가입되지 않은 이메일입니다",
    });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "ghost@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));

    expect(await screen.findByText("가입되지 않은 이메일입니다")).toBeInTheDocument();
  });

  it("shows verification error and stays on code step when verification fails", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });
    mockVerifyAndResetPassword.mockResolvedValue({
      success: false,
      error: "인증 코드가 올바르지 않습니다.",
    });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));
    await user.type(await screen.findByPlaceholderText("인증 코드 입력"), "999999");
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(await screen.findByText("인증 코드가 올바르지 않습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });

  it("shows completion state after verify succeeds and reset runs automatically", async () => {
    const user = userEvent.setup();
    mockSendResetCode.mockResolvedValue({ success: true });
    mockVerifyAndResetPassword.mockResolvedValue({ success: true });

    render(<FindPasswordForm />);

    await user.type(screen.getByLabelText("이메일 주소"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "인증코드 발송" }));
    await user.type(await screen.findByPlaceholderText("인증 코드 입력"), "123456");
    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.getByText("임시 비밀번호를 이메일로 발송했습니다.")).toBeInTheDocument();
    });

    expect(mockVerifyAndResetPassword).toHaveBeenCalledWith("user@example.com", "123456");
    expect(screen.getByRole("link", { name: "로그인으로 돌아가기" })).toHaveAttribute("href", "/sign-in");
  });
});
