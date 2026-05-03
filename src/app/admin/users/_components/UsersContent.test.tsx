import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UsersContent from "./UsersContent";

const push = vi.fn();
const toggle = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../_components/AdminLayoutClient", () => ({
  useSidebar: () => ({ toggle }),
}));

vi.mock("overlay-kit", () => ({
  overlay: { open: vi.fn() },
}));

vi.mock("../[userId]/_components/UserDeleteModal", () => ({
  default: () => null,
}));

const baseUser = {
  id: 1,
  name: "홍길동",
  username: "hong",
  email: "hong@example.com",
  roles: ["ROLE_USER"],
  status: "ACTIVE",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("UsersContent", () => {
  it("reflects the current searchField in the AdminHeader dropdown and placeholder", () => {
    render(
      <UsersContent
        searchParams={{ q: "hello", searchField: "email" }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    expect(screen.getByRole("combobox", { name: "검색 필드" })).toHaveTextContent("이메일");
    expect(screen.getByPlaceholderText("이메일로 검색...")).toBeInTheDocument();
  });

  it("updates the URL when changing searchField while preserving q and resetting page", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{ q: "hello", searchField: "name", page: "3", status: "ACTIVE" }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "검색 필드" }));
    await user.click(screen.getByRole("option", { name: "사용자명" }));

    expect(push).toHaveBeenCalledWith("/admin/users?q=hello&searchField=username&page=1&status=ACTIVE");
  });
});
