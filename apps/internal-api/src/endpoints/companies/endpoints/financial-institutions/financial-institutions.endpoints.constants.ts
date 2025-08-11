export const URL_V1 = '/v1/companies/:companyId/financial-institutions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;
export const URL_SYNC_TRANSACTIONS_V1 = `${URL_V1}/:financialInstitutionId/sync-transactions`;

export const CREDENTIALS_FIELDS_TO_MASK = [
  'accessToken',
  'apiKey',
  'clientId',
  'clientSecret',
  'password',
  'privateKey',
  'publicKey',
  'refreshToken',
  'secret',
  'token',
  'username',
];

export const COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
  },
  required: ['companyId'],
} as const;

export const SYNC_TRANSACTIONS_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    fromDate: { type: 'string', format: 'date' },
    toDate: { type: 'string', format: 'date' },
  },
  required: ['fromDate', 'toDate'],
} as const;

export const SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    financialInstitutionId: { type: 'string' },
  },
  required: ['companyId', 'financialInstitutionId'],
} as const; 