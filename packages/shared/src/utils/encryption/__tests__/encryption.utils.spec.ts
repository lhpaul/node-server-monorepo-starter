// Internal modules (farthest path first, then alphabetical)
import { getSecret } from '../../secrets';

// Local imports (alphabetical)
import { ENCRYPTION_KEY_SECRET_LABEL, ERRORS_MESSAGES } from '../encryption.utils.constants';
import { encryptText, decryptText } from '../encryption.utils';

// Mock the secrets module
jest.mock('../../secrets');
const mockGetSecret = getSecret as jest.MockedFunction<typeof getSecret>;

describe('Encryption Utils', () => {
  const mockEncryptionKey = 'test-encryption-key-32-chars-long';
  const testText = 'Hello, World!';
  const testTextWithSpecialChars = 'Hello, World! 🚀 @#$%^&*()_+{}|:"<>?[]\\;\',./';
  const testTextEmpty = '';
  const testTextLong = 'A'.repeat(1000);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSecret.mockReturnValue(mockEncryptionKey);
  });

  describe(encryptText.name, () => {
    it('should encrypt text successfully with provided encryption key', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testText);
    });

    it('should encrypt text successfully using environment encryption key', () => {
      const encrypted = encryptText(testText);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testText);
      expect(mockGetSecret).toHaveBeenCalledWith(ENCRYPTION_KEY_SECRET_LABEL);
    });

    it('should encrypt text with special characters', () => {
      const encrypted = encryptText(testTextWithSpecialChars, mockEncryptionKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testTextWithSpecialChars);
    });

    it('should encrypt empty string', () => {
      const encrypted = encryptText(testTextEmpty, mockEncryptionKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should encrypt long text', () => {
      const encrypted = encryptText(testTextLong, mockEncryptionKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testTextLong);
    });

    it('should produce different encrypted results for same input due to random salt and IV', () => {
      const encrypted1 = encryptText(testText, mockEncryptionKey);
      const encrypted2 = encryptText(testText, mockEncryptionKey);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should encrypt text with empty key', () => {
      const encrypted = encryptText(testText, '');
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testText);
    });

    it('should throw error when encryption key is undefined', () => {
      mockGetSecret.mockImplementation(() => {
        throw new Error('Secret not found');
      });

      expect(() => encryptText(testText)).toThrow('Encryption failed: Secret not found');
    });

    it('should encrypt text with short key', () => {
      const encrypted = encryptText(testText, 'short');
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
      expect(encrypted).not.toBe(testText);
    });
  });

  describe(decryptText.name, () => {
    it('should decrypt text successfully with provided encryption key', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testText);
    });

    it('should decrypt text successfully using environment encryption key', () => {
      const encrypted = encryptText(testText);
      const decrypted = decryptText(encrypted);
      
      expect(decrypted).toBe(testText);
      expect(mockGetSecret).toHaveBeenCalledWith(ENCRYPTION_KEY_SECRET_LABEL);
    });

    it('should decrypt text with special characters', () => {
      const encrypted = encryptText(testTextWithSpecialChars, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testTextWithSpecialChars);
    });

    it('should decrypt empty string', () => {
      const encrypted = encryptText(testTextEmpty, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testTextEmpty);
    });

    it('should decrypt long text', () => {
      const encrypted = encryptText(testTextLong, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testTextLong);
    });

    it('should throw error when encrypted text is invalid base64', () => {
      expect(() => decryptText('invalid-base64!@#', mockEncryptionKey)).toThrow('Decryption failed:');
    });

    it('should throw error when encrypted text has wrong format', () => {
      const invalidEncrypted = Buffer.from('invalid:format').toString('base64');
      expect(() => decryptText(invalidEncrypted, mockEncryptionKey)).toThrow('Decryption failed:');
    });

    it('should throw error when encrypted text is missing parts', () => {
      const invalidEncrypted = Buffer.from('salt:iv').toString('base64');
      expect(() => decryptText(invalidEncrypted, mockEncryptionKey)).toThrow('Decryption failed:');
    });

    it('should throw error when wrong encryption key is used', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      const wrongKey = 'wrong-encryption-key-32-chars';
      
      expect(() => decryptText(encrypted, wrongKey)).toThrow('Decryption failed:');
    });

    it('should decrypt text with empty key', () => {
      const encrypted = encryptText(testText, '');
      const decrypted = decryptText(encrypted, '');
      
      expect(decrypted).toBe(testText);
    });

    it('should throw error when encryption key is undefined', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      mockGetSecret.mockImplementation(() => {
        throw new Error('Secret not found');
      });

      expect(() => decryptText(encrypted)).toThrow('Decryption failed: Secret not found');
    });

    it('should throw error when encrypted text is empty', () => {
      expect(() => decryptText('', mockEncryptionKey)).toThrow('Decryption failed:');
    });
    it('should handle crypto errors gracefully', () => {
      // Mock crypto functions to throw errors
      const errorMessage = 'Crypto error';
      const originalCreateCipheriv = require('crypto').createCipheriv;
      require('crypto').createCipheriv = jest.fn().mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => encryptText(testText, mockEncryptionKey)).toThrow(ERRORS_MESSAGES.ENCRYPTION_FAILED(errorMessage));

      // Restore original function
      require('crypto').createCipheriv = originalCreateCipheriv;
    });
    it('should handle decryption errors gracefully', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      
      // Mock crypto functions to throw errors
      const errorMessage = 'Decryption crypto error'; 
      const originalCreateDecipheriv = require('crypto').createDecipheriv;
      require('crypto').createDecipheriv = jest.fn().mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => decryptText(encrypted, mockEncryptionKey)).toThrow(ERRORS_MESSAGES.DECRYPTION_FAILED(errorMessage));

      // Restore original function
      require('crypto').createDecipheriv = originalCreateDecipheriv;
    });
  });

  describe(`${encryptText.name} and ${decryptText.name} integration`, () => {
    it('should encrypt and decrypt text with same key successfully', () => {
      const encrypted = encryptText(testText, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(testText);
    });

    it('should encrypt and decrypt text with environment key successfully', () => {
      const encrypted = encryptText(testText);
      const decrypted = decryptText(encrypted);
      
      expect(decrypted).toBe(testText);
    });

    it('should handle multiple encrypt/decrypt cycles', () => {
      let currentText = testText;
      
      for (let i = 0; i < 5; i++) {
        const encrypted = encryptText(currentText, mockEncryptionKey);
        const decrypted = decryptText(encrypted, mockEncryptionKey);
        expect(decrypted).toBe(currentText);
        currentText = encrypted; // Use encrypted as input for next cycle
      }
    });

    it('should handle unicode characters correctly', () => {
      const unicodeText = 'Hello, 世界! 🌍 🚀';
      const encrypted = encryptText(unicodeText, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(unicodeText);
    });

    it('should handle binary-like data correctly', () => {
      const binaryText = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      const encrypted = encryptText(binaryText, mockEncryptionKey);
      const decrypted = decryptText(encrypted, mockEncryptionKey);
      
      expect(decrypted).toBe(binaryText);
    });
  });

}); 