export enum DeleteTransactionErrorCode {
  DOCUMENT_NOT_FOUND = 'document-not-found',
}
export enum UpdateTransactionErrorCode {
  DOCUMENT_NOT_FOUND = 'document-not-found',
}

export class DeleteTransactionError extends Error {
  code: DeleteTransactionErrorCode;
  data?: any;
  status?: number | null;

  constructor(input: {
    code: DeleteTransactionErrorCode;
    message?: string;
    data?: any;
    status?: number | null;
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
    this.status = input.status;
  }
}

export class UpdateTransactionError extends Error {
  code: UpdateTransactionErrorCode;
  data?: any;
  status?: number | null;

  constructor(input: {
    code: UpdateTransactionErrorCode;
    message?: string;
    data?: any;
    status?: number | null;
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
    this.status = input.status;
  }
}
