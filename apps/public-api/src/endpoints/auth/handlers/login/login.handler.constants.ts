export const STEPS = {
  DECODE_EMAIL_TOKEN:'decode-email-token',
  FIND_USER: 'find-user',
  GENERATE_USER_TOKEN: 'generate-user-token',
};

export const ERROR_RESPONSES = {
  NO_USER_FOUND: {
    code: 'no-user-found',
    message: (email: string) => `No user found with the provided email: ${email}`,
  },
};
