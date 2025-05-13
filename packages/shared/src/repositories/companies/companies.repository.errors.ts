export enum UpdateCompanyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export enum DeleteCompanyErrorCode {
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
}

export class UpdateCompanyError extends Error {
  code: UpdateCompanyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: UpdateCompanyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}

export class DeleteCompanyError extends Error {
  code: DeleteCompanyErrorCode;
  message: string;

  constructor({
    code,
    message,
  }: {
    code: DeleteCompanyErrorCode;
    message: string;
  }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
