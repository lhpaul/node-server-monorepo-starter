import { TransactionSourceType, TransactionType } from '@repo/shared/domain';

export const URL_V1 = '/v1/companies/:companyId/transactions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  TRANSACTION_NOT_FOUND: {
    code: 'transaction-not-found',
    message: 'Transaction not found',
  },
};

export const CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    categoryId: { type: 'string' },
    description: { type: 'string' },
    date: { type: 'string', format: 'date' },
    type: { enum: Object.values(TransactionType) },
  },
  required: ['amount', 'date', 'type'],
} as const;

export const COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
  },
  required: ['companyId'],
} as const;

export const COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    id: { type: 'string' },
  },
  required: ['companyId', 'id'],
} as const;

export const UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    date: { type: 'string' },
    type: { enum: Object.values(TransactionType) },
  },
} as const;
