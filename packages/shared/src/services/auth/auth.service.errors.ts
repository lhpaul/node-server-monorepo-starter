export enum DecodeEmailTokenErrorCode {
  INVALID_TOKEN = 'invalid-token',
}

export class DecodeEmailTokenError extends Error {
  code: DecodeEmailTokenErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: DecodeEmailTokenErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}