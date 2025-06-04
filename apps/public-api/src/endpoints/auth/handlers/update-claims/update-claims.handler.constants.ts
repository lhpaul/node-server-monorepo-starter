export const STEPS = {
  FIND_USER: {
    id: 'find-user',
  },
  UPDATE_CLAIMS: {
    id: 'update-claims',
  },
};

export const ERROR_RESPONSES = {
  INVALID_TOKEN: {
    code: 'invalid-token',
    message: 'Invalid token',
  },
  NO_USER_FOUND: {
    code: 'no-user-found',
    message: (email: string) => `No user found with the provided email: ${email}`,
  },
};
