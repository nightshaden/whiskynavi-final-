import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { api } from "@/apis/apis";

// Naver 커스텀 Provider
const NaverProvider = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { scope: "" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  profile(profile: {
    response: {
      id: string;
      name?: string;
      email?: string;
      profile_image?: string;
    };
  }) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image,
    };
  },
  clientId: process.env.NAVER_CLIENT_ID ?? "",
  clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
};

export const authOptions: NextAuthOptions = {
  providers: [
    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        try {
          const res = await api.signIn({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: String(res.userId),
            name: res.username,
            email: res.email,
            roles: res.userInfo.roles,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "로그인에 실패했습니다.";
          throw new Error(message);
        }
      },
    }),

    // Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Kakao
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),

    // Naver
    NaverProvider,
  ],

  pages: {
    signIn: "/sign-in",
    error: "/sign-in", // 에러 시 로그인 페이지로
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // 최초 로그인 시 user 정보를 token에 저장
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;

        // 소셜 로그인의 경우 provider 정보 저장
        if (account) {
          token.provider = account.provider;
          token.providerAccountId = account.providerAccountId;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // token 정보를 session에 전달
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles;
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },

    async signIn({ user, account }) {
      // 소셜 로그인 시 백엔드에 유저 정보 전달 (회원가입/로그인 처리)
      if (account?.provider !== "credentials") {
        try {
          // TODO: 백엔드 소셜 로그인 API 호출
          // await api.socialLogin({
          //   provider: account.provider,
          //   providerId: account.providerAccountId,
          //   email: user.email,
          //   name: user.name,
          // });
          console.log("소셜 로그인:", {
            provider: account?.provider,
            providerId: account?.providerAccountId,
            email: user.email,
            name: user.name,
          });
        } catch (error) {
          console.error("소셜 로그인 백엔드 연동 실패:", error);
          // 필요에 따라 false 반환하여 로그인 차단 가능
        }
      }
      return true;
    },
  },

  debug: process.env.NODE_ENV === "development",
};
