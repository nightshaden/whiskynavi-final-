import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AgreementSection } from "./AgreementSection";

describe("AgreementSection", () => {
  it("allows unchecking an individual agreement after selecting all", async () => {
    const user = userEvent.setup();

    render(<AgreementSection />);

    await user.click(screen.getByRole("checkbox", { name: "모두 동의합니다" }));
    await user.click(screen.getByRole("checkbox", { name: "[필수] 이용약관 동의" }));

    expect(screen.getByRole("checkbox", { name: "[필수] 이용약관 동의" })).toHaveAttribute("data-state", "unchecked");
    expect(screen.getByRole("checkbox", { name: "모두 동의합니다" })).toHaveAttribute("data-state", "unchecked");
  });

  it("updates marketing parent state when a child agreement is checked", async () => {
    const user = userEvent.setup();

    render(<AgreementSection />);

    await user.click(screen.getByRole("button", { name: "펼치기" }));
    await user.click(screen.getByRole("checkbox", { name: "이메일 수신 동의" }));
    await user.click(screen.getByRole("checkbox", { name: "SMS 수신 동의" }));
    await user.click(screen.getByRole("checkbox", { name: "SNS 수신 동의" }));

    expect(screen.getByRole("checkbox", { name: "[선택] 광고성 정보 수신 모두 동의" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("syncs hidden signup fields to the checked agreements", async () => {
    const user = userEvent.setup();

    const { container } = render(<AgreementSection />);

    await user.click(screen.getByRole("checkbox", { name: "[필수] 이용약관 동의" }));
    await user.click(screen.getByRole("checkbox", { name: "[필수] 개인 정보 수집 및 이용 동의" }));
    await user.click(screen.getByRole("button", { name: "펼치기" }));
    await user.click(screen.getByRole("checkbox", { name: "SMS 수신 동의" }));
    await user.click(screen.getByRole("checkbox", { name: "SNS 수신 동의" }));

    expect(container.querySelector('input[name="privacyAgree"]')).toHaveValue("true");
    expect(container.querySelector('input[name="emailAgree"]')).toHaveValue("false");
    expect(container.querySelector('input[name="smsAgree"]')).toHaveValue("true");
    expect(container.querySelector('input[name="snsAgree"]')).toHaveValue("true");
    expect(container.querySelector('input[name="marketingAgree"]')).toHaveValue("false");
  });
});
