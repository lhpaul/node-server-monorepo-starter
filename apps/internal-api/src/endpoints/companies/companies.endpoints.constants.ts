export const URL_V1 = '/v1/companies';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  COMPANY_NOT_FOUND: {
    code: 'company-not-found',
    message: 'Company not found',
  },
};

export const CREATE_COMPANY_BODY_JSON_SCHEMA = {
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

export const UPDATE_COMPANY_BODY_JSON_SCHEMA = {
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

export const COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const;
