import { KnownError } from '../errors/errors.utils.classes';

export enum RunRetriableActionErrorCode {
  MAX_RETRIES_REACHED = 'max-retries-reached',
}

export class RunRetriableActionError extends KnownError<RunRetriableActionErrorCode> {}