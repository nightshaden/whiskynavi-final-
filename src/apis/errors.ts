export class AuthError extends Error {
  constructor(message = "인증이 만료되었습니다. 다시 로그인해주세요.") {
    super(message);
    this.name = "AuthError";
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly userMessage: string;
  readonly detail: string;

  constructor(status: number, detail: string) {
    const userMessage = extractUserMessage(status, detail);
    super(userMessage);
    this.name = "ApiError";
    this.status = status;
    this.userMessage = userMessage;
    this.detail = detail;
  }
}

/**
 * API 에러 detail에서 사용자에게 보여줄 메시지를 추출한다.
 *
 * detail 형태 예시:
 * - '{"error":"이미 활성화된 계정이 존재합니다."}'
 * - '{"message":"비밀번호가 올바르지 않습니다."}'
 * - 'plain text error'
 * - '' (빈 문자열)
 */
const knownErrorMessages: Record<string, string> = {
  "Reservation window is not active.": "현재 예약 가능한 기간이 아닙니다.",
  "Already applied to this notice.": "이미 신청한 예약 공고입니다.",
  "Insufficient available quantity.": "남은 수량이 부족합니다.",
};

function extractUserMessage(status: number, detail: string): string {
  // 1) detail에서 JSON의 error / message 필드 추출 시도
  if (detail) {
    try {
      const json = JSON.parse(detail);
      const msg = json?.error ?? json?.message;
      if (typeof msg === "string" && msg.trim()) {
        return knownErrorMessages[msg.trim()] ?? msg.trim();
      }
    } catch {
      // JSON이 아닌 경우 plain text 그대로 사용 (단, 기술적 내용이 아닌 경우)
      const trimmed = detail.trim();
      if (trimmed && knownErrorMessages[trimmed]) {
        return knownErrorMessages[trimmed];
      }
      if (trimmed && !looksLikeTechnicalMessage(trimmed)) {
        return trimmed;
      }
    }
  }

  // 2) HTTP 상태별 기본 메시지
  return defaultMessageForStatus(status);
}

function looksLikeTechnicalMessage(text: string): boolean {
  // stack trace, HTML, 또는 영문 기술 에러로 보이는 경우 필터링
  return (
    text.includes("<html") ||
    text.includes("<!DOCTYPE") ||
    text.includes("at ") || // stack trace
    text.includes("Exception") ||
    text.includes("NullPointer") ||
    /^[A-Z][a-zA-Z]+Error:/.test(text)
  );
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "요청을 처리할 수 없습니다. 입력 내용을 확인해주세요.";
    case 401:
      return "인증이 만료되었습니다. 다시 로그인해주세요.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청하신 정보를 찾을 수 없습니다.";
    case 409:
      return "이미 처리된 요청입니다.";
    case 429:
      return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
    default:
      if (status >= 500) {
        return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export class NetworkError extends Error {
  constructor(message = "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * catch 블록에서 사용할 헬퍼.
 * ApiError면 userMessage, 그 외 unknown 에러는 fallback 메시지 반환.
 */
export function getUserErrorMessage(
  error: unknown,
  fallback = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
): string {
  if (error instanceof ApiError) return error.userMessage;
  if (error instanceof AuthError) return error.message;
  if (error instanceof NetworkError) return error.message;
  return fallback;
}
