import { KnownError } from '../errors/errors.utils.classes';

export enum CheckIfEventHasBeenProcessedErrorCode {
  MAX_RETRIES_REACHED = 'max-retries-reached',
  DOCUMENT_NOT_FOUND = 'document-not-found',
}

export class CheckIfEventHasBeenProcessedError extends KnownError<CheckIfEventHasBeenProcessedErrorCode> {}

export enum RunRetriableActionErrorCode {
  MAX_RETRIES_REACHED = 'max-retries-reached',
}

export class RunRetriableActionError extends KnownError<RunRetriableActionErrorCode> {}
