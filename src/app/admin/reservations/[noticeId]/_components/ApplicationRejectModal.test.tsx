import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rejectApplicationAction } from "../../actions";
import ApplicationRejectModal from "./ApplicationRejectModal";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("../../actions", () => ({
  rejectApplicationAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("ApplicationRejectModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes the entered reason when confirming rejection", async () => {
    const user = userEvent.setup();
    const close = vi.fn();

    render(<ApplicationRejectModal isOpen close={close} applicationId={123} applicantName="홍길동" />);

    await user.type(screen.getByLabelText("거절 사유"), "  재고 부족으로 거절합니다.  ");
    await user.click(screen.getByRole("button", { name: "거절" }));

    expect(rejectApplicationAction).toHaveBeenCalledWith(123, {
      reason: "재고 부족으로 거절합니다.",
    });
  });

  it("omits reason when the reason is blank", async () => {
    const user = userEvent.setup();

    render(<ApplicationRejectModal isOpen close={vi.fn()} applicationId={123} applicantName="홍길동" />);

    await user.type(screen.getByLabelText("거절 사유"), "   ");
    await user.click(screen.getByRole("button", { name: "거절" }));

    expect(rejectApplicationAction).toHaveBeenCalledWith(123, {});
  });
});
