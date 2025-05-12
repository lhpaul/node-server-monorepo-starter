import { TransactionType } from '@repo/shared/domain';

export const URL = '/transactions';
export const URL_WITH_ID = `${URL}/:id`;

export const BAD_REQUEST_ERROR_RESPONSES = {
  TRANSACTION_NOT_FOUND: {
    code: 'transaction-not-found',
    message: 'Transaction not found',
  },
};

export const CREATE_TRANSACTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    amount: { type: 'number' },
    date: { type: 'string' },
    type: { enum: Object.values(TransactionType) },
  },
  required: ['amount', 'date', 'type'],
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
    date: { type: 'string' },
    type: { enum: Object.values(TransactionType) },
  },
} as const;
