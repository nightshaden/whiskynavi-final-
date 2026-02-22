export class AuthError extends Error {
  constructor(message = "인증이 만료되었습니다. 다시 로그인해주세요.") {
    super(message);
    this.name = "AuthError";
  }
}
