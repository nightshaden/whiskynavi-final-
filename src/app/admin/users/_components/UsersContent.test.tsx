import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    push.mockClear();
  });

  it("reflects the current searchField in the AdminHeader dropdown and placeholder", () => {
    render(<UsersContent searchParams={{ q: "hello", searchField: "email" }} users={[baseUser]} totalElements={1} />);

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

  it("preserves excludedRoles as repeated query params when changing searchField", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{
          q: "hello",
          searchField: "name",
          page: "3",
          excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
        }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "검색 필드" }));
    await user.click(screen.getByRole("option", { name: "사용자명" }));

    expect(push).toHaveBeenCalledWith(
      "/admin/users?q=hello&searchField=username&page=1&excludedRoles=ROLE_WHISKYNAVI_MEMBER&excludedRoles=ROLE_WHISKYTALES_MEMBER",
    );
  });

  it("updates the URL to sort by name ascending when name header is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{
          page: "3",
          q: "hong",
          status: "ACTIVE",
          sortBy: "createdAt",
          sortDirection: "desc",
        }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이름 오름차순 정렬" }));

    expect(push).toHaveBeenCalledWith("/admin/users?page=1&q=hong&status=ACTIVE&sortBy=name&sortDirection=asc");
  });

  it("toggles name sort direction when name is already sorted", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{ page: "2", sortBy: "name", sortDirection: "asc" }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이름 내림차순 정렬" }));

    expect(push).toHaveBeenCalledWith("/admin/users?page=1&sortBy=name&sortDirection=desc");
  });

  it("updates the URL to sort by username ascending when username header is clicked", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{
          page: "3",
          q: "hong",
          status: "ACTIVE",
          sortBy: "createdAt",
          sortDirection: "desc",
        }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "사용자명 오름차순 정렬" }));

    expect(push).toHaveBeenCalledWith("/admin/users?page=1&q=hong&status=ACTIVE&sortBy=username&sortDirection=asc");
  });

  it("toggles username sort direction when username is already sorted", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{ page: "2", sortBy: "username", sortDirection: "asc" }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "사용자명 내림차순 정렬" }));

    expect(push).toHaveBeenCalledWith("/admin/users?page=1&sortBy=username&sortDirection=desc");
  });

  it("preserves excludedRoles as repeated query params when sorting", async () => {
    const user = userEvent.setup();

    render(
      <UsersContent
        searchParams={{
          page: "3",
          excludedRoles: ["ROLE_WHISKYNAVI_MEMBER", "ROLE_WHISKYTALES_MEMBER"],
        }}
        users={[baseUser]}
        totalElements={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이름 오름차순 정렬" }));

    expect(push).toHaveBeenCalledWith(
      "/admin/users?page=1&excludedRoles=ROLE_WHISKYNAVI_MEMBER&excludedRoles=ROLE_WHISKYTALES_MEMBER&sortBy=name&sortDirection=asc",
    );
  });
});
