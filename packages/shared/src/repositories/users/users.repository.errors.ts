export enum UpdateUserErrorCode {
  NOT_FOUND = 'NOT_FOUND',
}

export enum DeleteUserErrorCode {
  NOT_FOUND = 'NOT_FOUND',
}

export class UpdateUserError extends Error {
  code: UpdateUserErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: UpdateUserErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export class DeleteUserError extends Error {
  code: DeleteUserErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: DeleteUserErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
} 