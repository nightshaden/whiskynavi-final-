import { beforeEach, describe, expect, it, vi } from "vitest";

const callRefreshApiSingleFlightMock = vi.fn();
const decodeMock = vi.fn();
const encodeMock = vi.fn();

function createJwt(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.`;
}

vi.mock("@/apis/refresh-token", () => ({
  callRefreshApiSingleFlight: callRefreshApiSingleFlightMock,
}));

vi.mock("next-auth/jwt", () => ({
  decode: decodeMock,
  encode: encodeMock,
}));

describe("proxy", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret";
    decodeMock.mockResolvedValue({
      accessToken: createJwt(Math.floor((Date.now() - 1000) / 1000)),
      refreshToken: "old-refresh-token",
      tokenIssuedAt: Date.now(),
    });
    encodeMock.mockResolvedValue("new-session-token");
    callRefreshApiSingleFlightMock.mockResolvedValue({
      status: "success",
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });

  it("페이지 요청 전에 refresh가 필요하면 요청 쿠키와 응답 쿠키를 새 JWT로 갱신한다", async () => {
    const { proxy } = await import("./proxy");
    const requestCookieStore = new Map([["next-auth.session-token", "old-session-token"]]);
    const request = {
      headers: new Headers({
        Cookie: "next-auth.session-token=old-session-token",
      }),
      cookies: {
        get: (name: string) => {
          const value = requestCookieStore.get(name);
          return value ? { name, value } : undefined;
        },
        set: (name: string, value: string) => {
          requestCookieStore.set(name, value);
        },
      },
    } as never;

    expect(requestCookieStore.get("next-auth.session-token")).toBe("old-session-token");

    const response = await proxy(request);

    expect(callRefreshApiSingleFlightMock).toHaveBeenCalledWith("old-refresh-token");
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
    expect(requestCookieStore.get("next-auth.session-token")).toBe("new-session-token");
    expect(response.cookies.get("next-auth.session-token")?.value).toBe("new-session-token");
  });
});
