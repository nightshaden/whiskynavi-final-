import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieSetMock = vi.fn();
const decodeMock = vi.fn();
const encodeMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (name === "next-auth.session-token" ? { value: "old-session-token" } : undefined),
    set: cookieSetMock,
  })),
}));

vi.mock("next-auth/jwt", () => ({
  decode: decodeMock,
  encode: encodeMock,
}));

describe("refreshSessionToken", () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal("window", undefined);
    process.env.NEXTAUTH_SECRET = "test-secret";
    decodeMock.mockResolvedValue({
      accessToken: "old-access-token",
      refreshToken: "old-refresh-token",
      tokenIssuedAt: 1,
      error: "RefreshTemporaryError",
    });
    encodeMock.mockResolvedValue("new-session-token");
    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            accessToken: "Bearer new-access-token",
            refreshToken: "Bearer new-refresh-token",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
    process.env.NEXTAUTH_SECRET = originalSecret;
  });

  it("서버 refresh 성공 시 새 accessToken과 refreshToken을 JWT 쿠키에 저장한다", async () => {
    const { refreshSessionToken } = await import("./refresh-token");

    const newToken = await refreshSessionToken();

    expect(newToken).toBe("new-access-token");
    expect(encodeMock).toHaveBeenCalledWith({
      token: expect.objectContaining({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        tokenIssuedAt: expect.any(Number),
        error: undefined,
      }),
      secret: "test-secret",
      maxAge: 30 * 24 * 60 * 60,
    });
    expect(cookieSetMock).toHaveBeenCalledWith(
      "next-auth.session-token",
      "new-session-token",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
      }),
    );
  });

  it("서버 refresh 성공 후 쿠키 저장이 불가능해도 새 accessToken을 반환한다", async () => {
    cookieSetMock.mockImplementationOnce(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler.");
    });
    const { refreshSessionToken } = await import("./refresh-token");

    const newToken = await refreshSessionToken();

    expect(newToken).toBe("new-access-token");
    expect(encodeMock).toHaveBeenCalledWith({
      token: expect.objectContaining({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        tokenIssuedAt: expect.any(Number),
        error: undefined,
      }),
      secret: "test-secret",
      maxAge: 30 * 24 * 60 * 60,
    });
    expect(cookieSetMock).toHaveBeenCalled();
  });

  it("같은 refreshToken의 동시 refresh 요청은 백엔드에 한 번만 전달한다", async () => {
    const { callRefreshApiSingleFlight } = await import("./refresh-token");

    const [first, second] = await Promise.all([
      callRefreshApiSingleFlight("same-refresh-token"),
      callRefreshApiSingleFlight("same-refresh-token"),
    ]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual({
      status: "success",
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
    expect(second).toEqual(first);
  });
});
