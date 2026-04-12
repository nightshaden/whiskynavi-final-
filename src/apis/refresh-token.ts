const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.whiskynavi.com";

/**
 * refresh API 호출 결과.
 * - success: 새 accessToken + refreshToken
 * - auth_failed: refresh token이 만료/무효 (401/400) → 세션 파기 정당
 * - server_error: 서버 장애/네트워크 에러 (5xx, 연결 실패) → 세션 보존
 */
export type RefreshResult =
  | { status: "success"; accessToken: string; refreshToken: string }
  | { status: "auth_failed" }
  | { status: "server_error" };

/**
 * 백엔드 refresh API를 raw fetch로 호출한다.
 * customFetch를 사용하면 재귀가 발생하므로 반드시 raw fetch 사용.
 */
export async function callRefreshApi(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken ?? refreshToken;
      if (typeof newAccessToken === "string" && newAccessToken) {
        return {
          status: "success",
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
      }
      // 응답은 200이지만 토큰이 없는 경우 → 서버 오류로 취급
      return { status: "server_error" };
    }

    // 401/400/403: refresh token 자체가 만료/무효
    if (res.status === 401 || res.status === 400 || res.status === 403) {
      return { status: "auth_failed" };
    }

    // 5xx, 429 등: 서버 일시 장애 → 세션 보존
    return { status: "server_error" };
  } catch {
    // 네트워크 연결 실패, DNS 에러, 타임아웃 등
    return { status: "server_error" };
  }
}
