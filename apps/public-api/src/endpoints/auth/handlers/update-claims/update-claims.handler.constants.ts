export const STEPS = {
  FIND_USER: {
    id: 'find-user',
    obfuscatedId: '01',
  },
  UPDATE_CLAIMS: {
    id: 'update-claims',
    obfuscatedId: '02',
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
