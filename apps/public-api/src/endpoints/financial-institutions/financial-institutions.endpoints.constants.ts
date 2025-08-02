export const URL_V1 = '/v1/financial-institutions';

export const LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    countryCode: { 
      type: 'string',
      pattern: '^[A-Z]{2}$',
      description: 'ISO 3166-1 alpha-2 country code (e.g., US, CA, MX)'
    },
    name: { type: 'string' },
  },
} as const; 