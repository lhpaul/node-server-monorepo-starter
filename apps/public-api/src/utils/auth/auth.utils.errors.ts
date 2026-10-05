import { KnownError } from '@repo/shared/utils';

export enum DecodeEmailTokenErrorCode {
  INVALID_TOKEN = 'invalid-token',
}

export class DecodeEmailTokenError extends KnownError<DecodeEmailTokenErrorCode> {}

export enum UpdateUserPermissionsErrorCode {
  USER_NOT_FOUND = 'user-not-found',
}

export class UpdateUserPermissionsError extends KnownError<UpdateUserPermissionsErrorCode> {}