import { printError } from '../errors';

export const ALGORITHM = 'aes-256-cbc';
export const SALT_LENGTH = 16;
export const KEY_LENGTH = 32;

export const ERRORS_MESSAGES = {
  ENCRYPTION_FAILED: (error: unknown) => `Encryption failed: ${printError(error)}`,
  DECRYPTION_FAILED: (error: unknown) => `Decryption failed: ${printError(error)}`,
};
