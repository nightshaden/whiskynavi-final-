import { describe, expect, it } from "vitest";
import { shouldRefreshAuthToken } from "./auth-token";

function createJwt(expSeconds: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString("base64url");
  return `${header}.${payload}.`;
}

describe("shouldRefreshAuthToken", () => {
  it("accessToken exp가 이미 지났으면 갱신 대상으로 본다", () => {
    const accessToken = createJwt(Math.floor((Date.now() - 1000) / 1000));

    expect(
      shouldRefreshAuthToken({
        accessToken,
        refreshToken: "refresh-token",
      }),
    ).toBe(true);
  });

  it("accessToken exp가 남아 있으면 만료 임박이어도 갱신하지 않는다", () => {
    const accessToken = createJwt(Math.floor((Date.now() + 30 * 1000) / 1000));

    expect(
      shouldRefreshAuthToken({
        accessToken,
        refreshToken: "refresh-token",
      }),
    ).toBe(false);
  });

  it("accessToken exp를 읽을 수 없으면 자동 갱신하지 않는다", () => {
    expect(
      shouldRefreshAuthToken({
        accessToken: "opaque-access-token",
        refreshToken: "refresh-token",
      }),
    ).toBe(false);
  });
});
