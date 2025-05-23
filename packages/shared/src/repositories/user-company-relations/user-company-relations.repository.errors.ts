export enum UpdateUserCompanyRelationErrorCode {
  NOT_FOUND = 'NOT_FOUND',
}

export class UpdateUserCompanyRelationError extends Error {
  constructor(
    public readonly code: UpdateUserCompanyRelationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'UpdateUserCompanyRelationError';
  }
}

export enum DeleteUserCompanyRelationErrorCode {
  NOT_FOUND = 'NOT_FOUND',
}

export class DeleteUserCompanyRelationError extends Error {
  constructor(
    public readonly code: DeleteUserCompanyRelationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'DeleteUserCompanyRelationError';
  }
} 