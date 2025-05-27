export const URL_V1 = '/v1/auth';
export const URL_LOGIN = `${URL_V1}/login`;
export const LOGIN_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    token: { type: 'string' },
  },
  required: ['token'],
} as const;
export const URL_UPDATE_CLAIMS = `${URL_V1}/update-claims`;
