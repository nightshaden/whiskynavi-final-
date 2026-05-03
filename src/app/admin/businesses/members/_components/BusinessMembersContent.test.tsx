import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BusinessMembersSort } from "../sort";
import BusinessMembersContent from "./BusinessMembersContent";

const push = vi.fn();
const toggle = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/app/admin/_components/AdminLayoutClient", () => ({
  useSidebar: () => ({ toggle }),
}));

const defaultSearchParams = {
  page: "1",
  limit: "20",
};

const sortSearchParams = {
  page: "2",
  limit: "20",
  sort: "userId,desc" as BusinessMembersSort,
};

function renderContent({
  searchParams = defaultSearchParams,
  members = [],
  totalElements = 0,
}: Partial<ComponentProps<typeof BusinessMembersContent>> = {}) {
  render(
    <BusinessMembersContent
      searchParams={searchParams}
      members={members}
      totalElements={totalElements}
    />,
  );
}

describe("BusinessMembersContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    renderContent();
    expect(screen.getByText("사업자 멤버 관리")).toBeInTheDocument();
  });

  it("shows empty state when no members", () => {
    renderContent();
    expect(screen.getByText("사업자 멤버가 없습니다.")).toBeInTheDocument();
  });

  it("shows total count", () => {
    renderContent({ totalElements: 7 });
    expect(screen.getByText("총 7건")).toBeInTheDocument();
  });

  it("renders member row with name and username", () => {
    const mockMember = {
      userId: 10,
      name: "홍길동",
      username: "hong@example.com",
      hasPickupRole: false,
      roles: [],
    };
    renderContent({ members: [mockMember], totalElements: 1 });
    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByText("hong@example.com")).toBeInTheDocument();
  });

  it("shows 픽업 권한 있음 badge when hasPickupRole is true", () => {
    const mockMember = {
      userId: 11,
      name: "김철수",
      username: "kim@example.com",
      hasPickupRole: true,
      roles: [],
    };
    renderContent({ members: [mockMember], totalElements: 1 });
    expect(screen.getByText("픽업 권한 있음")).toBeInTheDocument();
  });

  it("navigates to the member detail page when the detail button is clicked", async () => {
    const user = userEvent.setup();

    renderContent({
      members: [
        {
          userId: 10,
          name: "홍길동",
          username: "hong@example.com",
          hasPickupRole: false,
          roles: [],
        },
      ],
      totalElements: 1,
    });

    await user.click(screen.getByRole("button", { name: "상세" }));

    expect(push).toHaveBeenCalledWith("/admin/businesses/members/10");
  });

  it("renders current sort option", () => {
    renderContent({ searchParams: sortSearchParams, totalElements: 25 });

    expect(screen.getByLabelText("정렬")).toHaveValue("userId,desc");
  });

  it("pushes a new query when sort is changed", async () => {
    const user = userEvent.setup();

    renderContent({ searchParams: sortSearchParams, totalElements: 25 });

    await user.selectOptions(screen.getByLabelText("정렬"), "userId,asc");

    expect(push).toHaveBeenCalledTimes(1);

    const [pushedUrl] = push.mock.calls[0];
    const url = new URL(pushedUrl, "https://example.com");

    expect(url.pathname).toBe("/admin/businesses/members");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("sort")).toBe("userId,asc");
  });
});
