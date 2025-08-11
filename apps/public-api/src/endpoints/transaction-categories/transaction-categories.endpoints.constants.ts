export const URL_V1 = '/v1/transaction-categories';

export const LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    type: { 
      type: 'string', 
      enum: ['income', 'expense'] 
    },
  },
} as const; 