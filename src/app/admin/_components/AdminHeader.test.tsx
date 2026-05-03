import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AdminHeader from "./AdminHeader";

const searchFieldOptions = [
  { value: "name", label: "이름" },
  { value: "email", label: "이메일" },
];

describe("AdminHeader", () => {
  it("renders the selected search field and matching placeholder", () => {
    render(
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={vi.fn()}
        searchField="email"
        searchFieldOptions={searchFieldOptions}
      />,
    );

    expect(screen.getByRole("combobox", { name: "검색 필드" })).toHaveTextContent("이메일");
    expect(screen.getByPlaceholderText("이메일로 검색...")).toBeInTheDocument();
  });

  it("calls onSearchFieldChange when selecting another search field", async () => {
    const user = userEvent.setup();
    const onSearchFieldChange = vi.fn();

    render(
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={vi.fn()}
        searchField="name"
        searchFieldOptions={searchFieldOptions}
        onSearchFieldChange={onSearchFieldChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "검색 필드" }));
    await user.click(screen.getByRole("option", { name: "이메일" }));

    expect(onSearchFieldChange).toHaveBeenCalledWith("email");
  });

  it("updates dropdown value and placeholder after selection in uncontrolled mode", async () => {
    const user = userEvent.setup();

    render(
      <AdminHeader
        title="회원 관리"
        onToggleSidebar={vi.fn()}
        searchFieldOptions={searchFieldOptions}
      />,
    );

    expect(screen.getByRole("combobox", { name: "검색 필드" })).toHaveTextContent("이름");
    expect(screen.getByPlaceholderText("이름으로 검색...")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: "검색 필드" }));
    await user.click(screen.getByRole("option", { name: "이메일" }));

    expect(screen.getByRole("combobox", { name: "검색 필드" })).toHaveTextContent("이메일");
    expect(screen.getByPlaceholderText("이메일로 검색...")).toBeInTheDocument();
  });

  it("keeps the default search placeholder without dropdown props", () => {
    render(<AdminHeader title="회원 관리" onToggleSidebar={vi.fn()} />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("이름으로 검색...")).toBeInTheDocument();
  });
});
