export enum UpdateApiKeyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export enum DeleteApiKeyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export class UpdateApiKeyError extends Error {
  code: UpdateApiKeyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: UpdateApiKeyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export class DeleteApiKeyError extends Error {
  code: DeleteApiKeyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: DeleteApiKeyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
} 