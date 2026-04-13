/**
 * 인증 흐름 전용 로거.
 *
 * 활성화 조건:
 * - development: 항상 출력
 * - production:  AUTH_DEBUG=1 환경변수 설정 시에만 출력
 */
const isEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.AUTH_DEBUG === "1";

const PREFIX = "[auth]";

export const authLogger = {
  /** 정상 흐름 중 주목할 이벤트 (401 수신, refresh 성공 등) */
  warn(message: string) {
    if (isEnabled) console.warn(`${PREFIX} ${message}`);
  },
  /** 인증 실패, redirect 등 에러 상황 */
  error(message: string, cause?: unknown) {
    if (isEnabled) {
      if (cause) {
        console.error(`${PREFIX} ${message}`, cause);
      } else {
        console.error(`${PREFIX} ${message}`);
      }
    }
  },
};
