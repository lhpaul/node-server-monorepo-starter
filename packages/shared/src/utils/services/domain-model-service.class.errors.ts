import { KnownError } from '../errors/errors.utils.classes';

export enum DomainModelServiceErrorCode {
  RESOURCE_NOT_FOUND = 'resource-not-found',
  RELATED_RESOURCE_NOT_FOUND = 'related-resource-not-found',
  UNKNOWN_ERROR = 'unknown-error',
}

export class DomainModelServiceError extends KnownError<DomainModelServiceErrorCode> {
  constructor({ code, message, data }: { code: DomainModelServiceErrorCode, message: string, data?: any }) {
    super({ code, message, data });
  }
}