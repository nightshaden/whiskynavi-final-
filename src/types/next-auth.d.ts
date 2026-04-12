import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles?: string[];
    } & DefaultSession["user"];
    accessToken?: string;
    // refreshToken은 서버(JWT) 내부에서만 사용 — 클라이언트에 노출하지 않음
    error?: "RefreshTokenError" | "RefreshTemporaryError";
  }

  interface User extends DefaultUser {
    roles?: string[];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    roles?: string[];
    provider?: string;
    providerAccountId?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenIssuedAt?: number;
    error?: "RefreshTokenError" | "RefreshTemporaryError";
  }
}
