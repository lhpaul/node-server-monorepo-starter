import { KnownError } from '../../../utils/errors/errors.utils.classes';

export enum DecodeEmailTokenErrorCode {
  INVALID_TOKEN = 'invalid-token',
}

export class DecodeEmailTokenError extends KnownError<DecodeEmailTokenErrorCode> {}