import { TransactionType } from '@repo/shared/domain';

export const URL_V1 = '/v1/transactions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  TRANSACTION_NOT_FOUND: {
    code: 'transaction-not-found',
    message: 'Transaction not found',
  },
};

export const CREATE_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    companyId: { type: 'string' },
    date: { type: 'string' },
    type: { enum: Object.values(TransactionType) },
  },
  required: ['amount', 'companyId', 'date', 'type'],
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
