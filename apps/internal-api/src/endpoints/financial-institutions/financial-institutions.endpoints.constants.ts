export const URL_V1 = '/v1/financial-institutions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  FINANCIAL_INSTITUTION_NOT_FOUND: {
    code: 'financial-institution-not-found',
    message: 'Financial institution not found',
  },
};

export const CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    countryCode: { 
      type: 'string',
      pattern: '^[A-Z]{2}$',
      description: 'ISO 3166-1 alpha-2 country code (e.g., US, CA, MX)'
    },
    name: { type: 'string' },
  },
  required: ['countryCode', 'name'],
} as const;

export const UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA = {
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

export const FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const; 