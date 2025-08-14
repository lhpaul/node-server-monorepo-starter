export const URL_V1 = '/v1/subscriptions';
export const URL_WITH_ID_V1 = '/v1/subscriptions/:id';

export const ERROR_RESPONSES = {
  COMPANY_NOT_FOUND: {
    code: 'company-not-found',
    message: (companyId: string) => `Company not found: ${companyId}`,
  },
  SUBSCRIPTION_NOT_FOUND: {
    code: 'SUBSCRIPTION_NOT_FOUND',
    message: 'Subscription not found',
  }
};

export const SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const;

export const CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    companyId: { type: 'string' },
    startsAt: { type: 'string', format: 'date' },
    endsAt: { type: 'string', format: 'date' },
  },
  required: ['companyId', 'startsAt', 'endsAt'],
} as const;

export const UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    startsAt: { type: 'string', format: 'date' },
    endsAt: { type: 'string', format: 'date' },
  },
} as const; 