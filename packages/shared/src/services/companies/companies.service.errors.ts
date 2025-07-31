import { KnownError } from '../../utils/errors/errors.utils.classes';

export enum AddFinancialInstitutionErrorCode {
  INVALID_CREDENTIALS_FORMAT = 'invalid-credentials-format',
  RELATION_ALREADY_EXISTS = 'relation-already-exists',
}

export class AddFinancialInstitutionError extends KnownError<AddFinancialInstitutionErrorCode> {}

export enum RemoveFinancialInstitutionErrorCode {
  RELATION_NOT_FOUND = 'relation-not-found',
}

export class RemoveFinancialInstitutionError extends KnownError<RemoveFinancialInstitutionErrorCode> {}

export enum UpdateFinancialInstitutionErrorCode {
  INVALID_CREDENTIALS_FORMAT = 'invalid-credentials-format',
  RELATION_NOT_FOUND = 'relation-not-found',
}

export class UpdateFinancialInstitutionError extends KnownError<UpdateFinancialInstitutionErrorCode> {}

export enum GetFinancialInstitutionRelationErrorCode {
  RELATION_NOT_FOUND = 'relation-not-found',
  DECRYPTION_FAILED = 'decryption-failed',
  INVALID_CREDENTIALS_FORMAT = 'invalid-credentials-format',
}

export class GetFinancialInstitutionRelationError extends KnownError<GetFinancialInstitutionRelationErrorCode> {}