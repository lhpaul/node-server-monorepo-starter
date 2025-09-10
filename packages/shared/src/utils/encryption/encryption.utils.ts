import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { SECRETS } from '../../constants';
import { getSecret } from '../secrets';
import {
  ALGORITHM,
  ERRORS_MESSAGES,
  KEY_LENGTH,
  SALT_LENGTH,
} from './encryption.utils.constants';


/**
 * Encrypts a string using AES-256-CBC encryption
 * @param text - The text to encrypt
 * @param encryptionKey - The encryption key to use. If not provided, the key will be read from the secret ENCRYPTION_KEY.
 * @returns The encrypted text in base64 format
 */
export function encryptText(text: string, encryptionKey?: string): string {
  try {
    const password = encryptionKey || getSecret(SECRETS.ENCRYPTION_KEY);
    const salt = randomBytes(SALT_LENGTH);
    const key = scryptSync(password, salt, KEY_LENGTH);
    const iv = randomBytes(16);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine salt, IV and encrypted data
    const result = salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted;
    return Buffer.from(result).toString('base64');
  } catch (error) {
    throw new Error(ERRORS_MESSAGES.ENCRYPTION_FAILED(error));
  }
}

/**
 * Decrypts a string that was encrypted using AES-256-CBC encryption
 * @param encryptedText - The encrypted text in base64 format
 * @param encryptionKey - The encryption key to use. If not provided, the key will be read from the secret ENCRYPTION_KEY.
 * @returns The decrypted text
 */
export function decryptText(encryptedText: string, encryptionKey?: string): string {
  try {
    const password = encryptionKey || getSecret(SECRETS.ENCRYPTION_KEY);
    const combined = Buffer.from(encryptedText, 'base64').toString('utf8');
    const [saltHex, ivHex, encrypted] = combined.split(':');
    
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = scryptSync(password, salt, KEY_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(ERRORS_MESSAGES.DECRYPTION_FAILED(error));
  }
} 