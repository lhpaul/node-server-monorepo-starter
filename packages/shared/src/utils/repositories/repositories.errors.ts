import { KnownError } from '../errors/errors.utils.classes';

export const REPOSITORY_ERROR_MESSAGES = {
  DOCUMENT_NOT_FOUND: (documentId: string) => `Document with id ${documentId} not found`,
  RELATED_DOCUMENT_NOT_FOUND: (parentDocumentRef: string) => `Related document not found: ${parentDocumentRef}`,
};

export enum RepositoryErrorCode {
  DOCUMENT_NOT_FOUND = 'document-not-found',
  RELATED_DOCUMENT_NOT_FOUND = 'related-document-not-found',
}

export class RepositoryError extends KnownError<RepositoryErrorCode> {}