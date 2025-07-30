export const URL_V1 = '/v1/transaction-categories';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  TRANSACTION_CATEGORY_NOT_FOUND: {
    code: 'transaction-category-not-found',
    message: 'Transaction category not found',
  },
};

export const CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['income', 'expense']
    },
  },
  required: ['name', 'type'],
} as const;

export const UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['income', 'expense']
    },
  },
} as const;

export const TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const; 