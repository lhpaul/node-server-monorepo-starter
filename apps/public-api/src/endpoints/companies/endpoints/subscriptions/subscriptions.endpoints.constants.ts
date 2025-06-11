export const URL_V1 = '/v1/companies/:companyId/subscriptions';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
  },
  required: ['companyId'],
} as const;

export const COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    id: { type: 'string' },
  },
  required: ['companyId', 'id'],
} as const; 