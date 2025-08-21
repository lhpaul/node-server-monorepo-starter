import { TransactionSourceType, TransactionType } from '@repo/shared/domain';

export const URL_V1 = '/v1/transactions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  COMPANY_NOT_FOUND: {
    code: 'company-not-found',
    message: (companyId: string) => `Company not found: ${companyId}`,
  },
  TRANSACTION_NOT_FOUND: {
    code: 'transaction-not-found',
    message: 'Transaction not found',
  }
};

export const CREATE_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    categoryId: { type: 'string' },
    companyId: { type: 'string' },
    date: { type: 'string', format: 'date' },
    description: { type: 'string' },
    sourceId: { type: 'string' },
    sourceTransactionId: { type: 'string' },
    sourceType: { enum: Object.values(TransactionSourceType) },
    type: { enum: Object.values(TransactionType) },
  },
  required: ['amount', 'companyId', 'date', 'sourceId', 'sourceTransactionId', 'sourceType', 'type'],
} as const;

export const TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const;

export const UPDATE_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    companyId: { type: 'string' },
    date: { type: 'string' },
    type: { enum: Object.values(TransactionType) },
  },
} as const;
