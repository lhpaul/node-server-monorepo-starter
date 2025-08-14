export const URL_V1 = '/v1/users';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;

export const ERROR_RESPONSES = {
  USER_NOT_FOUND: {
    code: 'user-not-found',
    message: 'User not found',
  },
};

export const UPDATE_USER_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    email: { 
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
  },
  required: ['email'],
} as const;

export const USER_ENDPOINTS_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const;
