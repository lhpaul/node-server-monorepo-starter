export const URL_V1 = '/v1/financial-institutions';

export const LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
} as const; 