export const DECODE_EMAIL_TOKEN_ERROR_MESSAGES = {
  NO_EMAIL_IN_TOKEN: 'No email in token',
};

export const GENERATE_USER_TOKEN_STEPS = {
  GENERATE_USER_TOKEN: 'generate-user-token',
};
export const LOG_GROUP_NAME = 'AuthUtils';

export const UPDATE_USER_PERMISSIONS_STEPS = {
  GET_USER: 'get-user',
  UPDATE_USER_PERMISSIONS: 'update-user-permissions',
}

export const UPDATE_USER_PERMISSIONS_ERROR_MESSAGES = {
  USER_NOT_FOUND: (userId: string) => `User ${userId} not found`,
}
