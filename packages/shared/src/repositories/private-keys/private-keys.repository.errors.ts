export enum UpdatePrivateKeyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export enum DeletePrivateKeyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export class UpdatePrivateKeyError extends Error {
  code: UpdatePrivateKeyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: UpdatePrivateKeyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export class DeletePrivateKeyError extends Error {
  code: DeletePrivateKeyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: DeletePrivateKeyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
} 