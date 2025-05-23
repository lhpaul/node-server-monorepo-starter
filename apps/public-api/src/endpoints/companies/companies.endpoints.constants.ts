export const URL_V1 = '/v1/companies';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const COMPANY_NOT_FOUND_ERROR = (companyId: string) => `Company with id ${companyId} not found`;

export const UPDATE_COMPANY_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
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
