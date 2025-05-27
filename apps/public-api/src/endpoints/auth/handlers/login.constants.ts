export const STEPS = {
  DECODE_EMAIL_TOKEN: { id: 'decode-email-token', obfuscatedId: '01' },
  FIND_USER: { id: 'find-user', obfuscatedId: '02' },
  GENERATE_USER_TOKEN: { id: 'generate-user-token', obfuscatedId: '03' },
};

export const ERROR_RESPONSES = {
  NO_USER_FOUND: {
    code: 'no-user-found',
    message: (email: string) => `No user found with the provided email: ${email}`,
  },
};
