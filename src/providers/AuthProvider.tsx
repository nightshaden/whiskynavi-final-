"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  children: ReactNode;
};

/**
 * session.error가 "RefreshTokenError"이면 자동 signOut.
 * "RefreshTemporaryError"는 일시적 장애이므로 무시 — 다음 요청에서 재시도됨.
 */
function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signOut({ callbackUrl: "/sign-in" });
    }
  }, [session?.error]);

  return null;
}

export function AuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <SessionErrorHandler />
      {children}
    </SessionProvider>
  );
}
