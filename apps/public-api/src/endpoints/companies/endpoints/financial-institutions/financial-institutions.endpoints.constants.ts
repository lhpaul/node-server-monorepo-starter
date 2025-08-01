export const URL_V1 = '/v1/companies/:companyId/financial-institutions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

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

export const ERROR_RESPONSES = {
  FINANCIAL_INSTITUTION_RELATION_NOT_FOUND: {
    code: 'financial-institution-relation-not-found',
    logId: 'financial-institution-relation-not-found',
    message: 'Financial institution relation not found',
  },
  FINANCIAL_INSTITUTION_ALREADY_EXISTS: {
    code: 'financial-institution-already-exists',
    logId: 'financial-institution-already-exists',
    message: 'Financial institution is already associated with this company',
  },
  INVALID_CREDENTIALS_FORMAT: {
    code: 'invalid-credentials-format',
    logId: 'invalid-credentials-format',
    message: 'Invalid credentials format',
  },
};

export const CREATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    credentials: { type: 'object' },
    financialInstitutionId: { type: 'string' },
  },
  required: ['financialInstitutionId', 'credentials'],
} as const;

export const UPDATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    credentials: { type: 'object' },
  },
  required: ['credentials'],
} as const;

export const COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
  },
  required: ['companyId'],
} as const;

export const COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    id: { type: 'string' },
  },
  required: ['companyId', 'id'],
} as const; 