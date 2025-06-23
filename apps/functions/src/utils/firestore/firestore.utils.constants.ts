import { printError } from '@repo/shared/utils';

export enum EVENT_LABELS {
  ON_CREATE = 'on-create',
  ON_UPDATE = 'on-update',
  ON_DELETE = 'on-delete'
}

export const LOGS = {
  ON_CREATE: {
    id: 'on-create',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on create.`
  },
  ON_UPDATE: {
    id: 'on-update',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on update.`
  },
  ON_UPDATE_INVALID_UPDATED_AT: {
    id: 'on-update-invalid-updated-at',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on update invalid updatedAt.`
  },
  ON_UPDATE_RETRY_TIMEOUT: {
    id: 'on-update-retry-timeout',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on update retry timeout.`
  },
  ON_DELETE: {
    id: 'on-delete',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on delete.`
  },
  ON_CREATE_ALREADY_PROCESSED: {
    id: 'on-create-already-processed',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on create already processed.`
  },
  ON_CREATE_MAX_RETRIES_REACHED: {
    id: 'on-create-max-retries-reached',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on create max retries reached.`
  },
  ON_CREATE_MAX_RETRIES_REACHED_UPDATE_ERROR: {
    id: 'on-create-max-retries-reached-update-error',
    message: (documentLabel: string, documentId: string, error: any) => `${documentLabel} ${documentId} on create max retries reached update error: ${printError(error)}`
  },
  ON_CREATE_UNKNOWN_ERROR: {
    id: 'on-create-unknown-error',
    message: (documentLabel: string, documentId: string) => `${documentLabel} ${documentId} on create unknown error.`
  },
  ON_CREATE_UNKNOWN_ERROR_UPDATE_ERROR: {
    id: 'on-create-unknown-error-update-error',
    message: (documentLabel: string, documentId: string, error: any) => `${documentLabel} ${documentId} on create unknown error update error: ${printError(error)}`
  }
};

export const STEPS = {
  INITIAL_TRANSACTION: {
    id: 'initial-transaction',
  }
};

export const PREFIXES = {
  ON_CREATE: '_onCreate',
  ON_UPDATE: '_onUpdate',
  ON_DELETE: '_onDelete'
};

export const DEFAULT_ON_UPDATE_RETRY_TIMEOUT_IN_MS = 600000;