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

  it("renders member name in read-only mode", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("홍길동")).toBeInTheDocument();
  });

  it("renders submitted business registration document link", () => {
    render(
      <BusinessMemberDetailContent
        member={{
          ...mockMember,
          documentDownloadUrl: "https://example.com/business-document.pdf",
          documentOriginalFilename: "사업자등록증.pdf",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: "사업자등록증.pdf" });
    expect(screen.getByText("사업자등록증")).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/business-document.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not show pickup role text in the member info section", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.queryByText("픽업 권한 없음")).not.toBeInTheDocument();
    expect(screen.queryByText("픽업 권한 있음")).not.toBeInTheDocument();
  });

  it("shows grant button when hasPickupRole is false", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByText("권한 정보")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "픽업 부여" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "픽업 회수" })).toBeDisabled();
  });

  it("renders grant and revoke buttons for each business role", () => {
    render(
      <BusinessMemberDetailContent
        member={{
          ...mockMember,
          hasBusinessRole: true,
          hasTrailntaleBusinessRole: false,
          hasCommunityBusinessRole: true,
          hasPickupRole: false,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "사업자 권한 부여" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "사업자 권한 회수" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "트레일앤테일 부여" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "트레일앤테일 회수" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "커뮤니티 부여" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "커뮤니티 회수" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "픽업 부여" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "픽업 회수" })).toBeDisabled();
  });

  it("shows revoke button when hasPickupRole is true", () => {
    render(<BusinessMemberDetailContent member={{ ...mockMember, hasPickupRole: true }} />);

    expect(screen.getByRole("button", { name: "픽업 부여" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "픽업 회수" })).toBeEnabled();
  });

  it("renders back button", () => {
    render(<BusinessMemberDetailContent member={mockMember} />);
    expect(screen.getByRole("button", { name: "멤버 목록으로 돌아가기" })).toBeInTheDocument();
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

  it("keeps role action buttons disabled according to role state while edit mode is active", async () => {
    const user = userEvent.setup();

    render(<BusinessMemberDetailContent member={mockMember} />);

    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("button", { name: "픽업 부여" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "픽업 회수" })).toBeDisabled();
  });
});
