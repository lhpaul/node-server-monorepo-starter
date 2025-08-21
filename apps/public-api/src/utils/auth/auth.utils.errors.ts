import { KnownError } from '@repo/shared/utils';

export enum DecodeEmailTokenErrorCode {
  INVALID_TOKEN = 'invalid-token',
}

export class DecodeEmailTokenError extends KnownError<DecodeEmailTokenErrorCode> {}