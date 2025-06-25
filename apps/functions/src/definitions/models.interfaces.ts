import { DocumentModel } from '@repo/shared/definitions';

export enum ProcessStatus {
  PENDING = 'pending',
  DONE = 'done',
  FAILED = 'failed',
}

export interface ProcessResource extends DocumentModel {
  status: ProcessStatus;
  error: any;
}