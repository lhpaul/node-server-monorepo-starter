import { getEnvironmentVariable } from '../environment-variables';
import { SECRET_NOT_FOUND_ERROR_MESSAGE } from './secrets.utils.constants';

/**
 * Get a secret from the environment variables
 * @param key - The key of the secret to get
 * @returns The secret
 */
export function getSecret(key: string): string {
  const secret = getEnvironmentVariable(key);
  if (!secret) {
    throw new Error(SECRET_NOT_FOUND_ERROR_MESSAGE(key));
  }
  return secret;
}