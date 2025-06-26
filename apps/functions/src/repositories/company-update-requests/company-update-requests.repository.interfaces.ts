import { QueryInput, QueryItem } from '@repo/shared/definitions';

import { ProcessResource, ProcessStatus } from '../../definitions';

export interface CompanyUpdateRequestDocument extends ProcessResource {
  name: string;
}

export interface CreateCompanyUpdateRequestDocumentInput {
  name: string;
  error: null;
  status: ProcessStatus.PENDING;
}

export interface UpdateCompanyUpdateRequestDocumentInput {
  name?: string;
  error?: any;
  status?: ProcessStatus;
}

export interface QueryCompanyUpdateRequestsInput extends QueryInput {
  name?: QueryItem<string>[];
  status?: QueryItem<ProcessStatus>[];
} 