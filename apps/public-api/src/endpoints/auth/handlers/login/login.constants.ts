export const STEPS = {
  DECODE_EMAIL_TOKEN: { id: 'decode-email-token'},
  FIND_USER: { id: 'find-user' },
  GENERATE_USER_TOKEN: { id: 'generate-user-token' },
};

export const ERROR_RESPONSES = {
  NO_USER_FOUND: {
    code: 'no-user-found',
    message: (email: string) => `No user found with the provided email: ${email}`,
  },
};
