import { KnownError } from '../../utils';

export enum AddFinancialInstitutionErrorCode {
  INVALID_CREDENTIALS_FORMAT = 'invalid-credentials-format',
  RELATION_ALREADY_EXISTS = 'relation-already-exists',
}

export class AddFinancialInstitutionError extends KnownError<AddFinancialInstitutionErrorCode> {}

export enum RemoveFinancialInstitutionErrorCode {
  RELATION_NOT_FOUND = 'relation-not-found',
}

export class RemoveFinancialInstitutionError extends KnownError<RemoveFinancialInstitutionErrorCode> {}