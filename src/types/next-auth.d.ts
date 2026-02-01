import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    // 백엔드 accessToken을 세션에 포함할 경우
    // accessToken?: string;
  }

  interface User extends DefaultUser {
    // 백엔드에서 받는 추가 필드
    // accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    provider?: string;
    providerAccountId?: string;
    // accessToken?: string;
  }
}
