import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";
import DesktopAuthArea from "./DesktopAuthArea";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

const mockedUseSession = vi.mocked(useSession);

describe("DesktopAuthArea", () => {
  it("shows guest order lookup next to login for anonymous users", () => {
    mockedUseSession.mockReturnValue({ data: null, status: "unauthenticated", update: vi.fn() });

    render(<DesktopAuthArea onOpenUserMenu={vi.fn()} />);

    expect(screen.getByRole("link", { name: "비회원 주문조회" })).toHaveAttribute("href", "/orders/guest");
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/sign-in");
  });
});
