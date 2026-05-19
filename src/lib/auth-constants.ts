/**
 * NextAuth JWT 세션 유지 시간(초).
 * authOptions.session.maxAge와 서버 refresh 쿠키 재저장 maxAge가 같은 값을 사용해야 한다.
 */
export const AUTH_SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;
