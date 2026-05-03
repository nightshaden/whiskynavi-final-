import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BusinessMemberDetailContent from "./BusinessMemberDetailContent";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

vi.mock("../actions", () => ({
  updateBusinessAction: vi.fn(),
}));

const mockMember = {
  userId: 10,
  name: "홍길동",
  username: "hong@example.com",
  businessName: "테스트 주류",
  businessRegistrationNumber: "123-45-67890",
  businessType: "HOUSEHOLD" as const,
  contact: "010-1234-5678",
  pickupAddress: "서울시 강남구",
  hasPickupRole: false,
  roles: [],
  businessCreatedAt: "2024-01-01T00:00:00Z",
  businessUpdatedAt: "2024-01-15T00:00:00Z",
};

describe("BusinessMemberDetailContent", () => {
  it("renders page title", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("사업자 멤버 상세")).toBeInTheDocument();
  });

  it("renders business name in read-only mode", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("테스트 주류")).not.toBeInTheDocument();
  });

  it("shows grant button when hasPickupRole is false", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("픽업 권한 부여")).toBeInTheDocument();
    expect(screen.queryByText("픽업 권한 회수")).not.toBeInTheDocument();
  });

  it("enters edit mode when clicking 수정", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByDisplayValue("테스트 주류")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123-45-67890")).toBeInTheDocument();
    expect(screen.getByDisplayValue("010-1234-5678")).toBeInTheDocument();
    expect(screen.getByDisplayValue("서울시 강남구")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
  });

  it("shows current business type in edit mode", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("combobox")).toHaveValue("HOUSEHOLD");
  });

  it("returns to read-only mode when cancel is clicked", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("button", { name: "저장" })).not.toBeInTheDocument();
    expect(screen.getByText("테스트 주류")).toBeInTheDocument();
  });

  it("hides pickup action while edit mode is active", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(
      screen.queryByRole("button", { name: "픽업 권한 부여" }),
    ).not.toBeInTheDocument();
  });
});
