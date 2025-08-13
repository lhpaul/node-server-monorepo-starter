export const FIREBASE_DECODE_ID_TOKEN_ERROR_LOG = {
  logId: 'firebase-decode-id-token-error',
  logMessage: 'Error decoding ID token',
};
export const FIREBASE_DECODE_ID_TOKEN_ERROR_CODES = {
  'auth/argument-error': {
    code: 'invalid-token',
    message: 'The token is invalid'
  },
  'auth/id-token-expired': {
    code: 'token-expired',
    message: 'The token has expired'
  },
};
