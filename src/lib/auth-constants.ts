/**
 * NextAuth JWT 세션 유지 시간(초).
 * authOptions.session.maxAge와 서버 refresh 쿠키 재저장 maxAge가 같은 값을 사용해야 한다.
 */
export const AUTH_SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

/**
 * next-auth v4 JWT 세션 쿠키명.
 * HTTPS 환경에서는 __Secure- prefix 쿠키가 사용될 수 있다.
 */
export const AUTH_SESSION_COOKIE_NAMES = ["next-auth.session-token", "__Secure-next-auth.session-token"] as const;
