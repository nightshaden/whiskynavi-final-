type ShouldRefreshAuthTokenParams = {
  accessToken?: unknown;
  refreshToken?: unknown;
};

function decodeBase64UrlJson(value: string): unknown {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function getJwtExpiresAtMs(accessToken: string): number | null {
  const [, payload] = accessToken.split(".");
  if (!payload) return null;

  try {
    const decoded = decodeBase64UrlJson(payload);
    if (typeof decoded === "object" && decoded !== null && "exp" in decoded) {
      const exp = (decoded as { exp?: unknown }).exp;
      return typeof exp === "number" ? exp * 1000 : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function shouldRefreshAuthToken({ accessToken, refreshToken }: ShouldRefreshAuthTokenParams): boolean {
  if (typeof refreshToken !== "string" || !refreshToken) return false;

  if (typeof accessToken === "string" && accessToken) {
    const expiresAt = getJwtExpiresAtMs(accessToken);
    if (expiresAt !== null) {
      return expiresAt <= Date.now();
    }
  }

  return false;
}
