import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelApplicationAction } from "../../actions";
import ApplicationCancelModal from "./ApplicationCancelModal";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("../../actions", () => ({
  cancelApplicationAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ApplicationCancelModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the entered reason when confirming cancellation", async () => {
    const user = userEvent.setup();

    render(<ApplicationCancelModal isOpen close={vi.fn()} applicationId={456} applicantName="김철수" />);

    await user.type(screen.getByLabelText("취소 사유"), "  고객 요청으로 취소합니다.  ");
    await user.click(screen.getByRole("button", { name: "취소 확인" }));

    expect(cancelApplicationAction).toHaveBeenCalledWith(456, {
      reason: "고객 요청으로 취소합니다.",
    });
  });

  it("omits reason when the reason is blank", async () => {
    const user = userEvent.setup();

    render(<ApplicationCancelModal isOpen close={vi.fn()} applicationId={456} applicantName="김철수" />);

    await user.type(screen.getByLabelText("취소 사유"), "   ");
    await user.click(screen.getByRole("button", { name: "취소 확인" }));

    expect(cancelApplicationAction).toHaveBeenCalledWith(456, {});
  });
});
