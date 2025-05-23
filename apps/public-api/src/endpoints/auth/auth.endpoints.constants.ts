export const URL_V1 = '/v1/auth';
export const URL_LOGIN = `${URL_V1}/login`;
export const LOGIN_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['email', 'password'],
} as const;
