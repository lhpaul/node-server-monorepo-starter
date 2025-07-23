import { getEnvVariable } from '../env-variables.utils';
import { ENV_VARIABLES_UTILS_CONSTANTS } from '../env-variables.utils.constants';

describe(getEnvVariable.name, () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('non-secret variables', () => {
    it('should return DEV value when APP_ENV is DEV', () => {
      process.env.APP_ENV = 'DEV';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_PROJECT_ID.DEV);
    });

    it('should return STG value when APP_ENV is STG', () => {
      process.env.APP_ENV = 'STG';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_PROJECT_ID.STG);
    });

    it('should return PROD value when APP_ENV is PROD', () => {
      process.env.APP_ENV = 'PROD';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_PROJECT_ID.PROD);
    });

    it('should return DEV value for FIREBASE_DATABASE_URL when APP_ENV is DEV', () => {
      process.env.APP_ENV = 'DEV';
      
      const result = getEnvVariable('FIREBASE_DATABASE_URL');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_DATABASE_URL.DEV);
    });

    it('should return STG value for FIREBASE_DATABASE_URL when APP_ENV is STG', () => {
      process.env.APP_ENV = 'STG';
      
      const result = getEnvVariable('FIREBASE_DATABASE_URL');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_DATABASE_URL.STG);
    });

    it('should return PROD value for FIREBASE_DATABASE_URL when APP_ENV is PROD', () => {
      process.env.APP_ENV = 'PROD';
      
      const result = getEnvVariable('FIREBASE_DATABASE_URL');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_DATABASE_URL.PROD);
    });

    it('should return undefined when APP_ENV is not set', () => {
      delete process.env.APP_ENV;
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when APP_ENV is set to an invalid environment', () => {
      process.env.APP_ENV = 'INVALID_ENV';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBeUndefined();
    });
  });

  describe('secret variables', () => {
    it('should return process.env value for non-constant variables', () => {
      const secretValue = 'secret-api-key-123';
      process.env.SECRET_API_KEY = secretValue;
      
      const result = getEnvVariable('SECRET_API_KEY');
      
      expect(result).toBe(secretValue);
    });

    it('should return undefined for non-existent secret variables', () => {
      const result = getEnvVariable('NON_EXISTENT_VARIABLE');
      
      expect(result).toBeUndefined();
    });

    it('should return empty string for secret variables set to empty string', () => {
      process.env.EMPTY_SECRET = '';
      
      const result = getEnvVariable('EMPTY_SECRET');
      
      expect(result).toBe('');
    });
  });

  describe('mixed scenarios', () => {
    it('should prioritize non-secret variables over process.env when both exist', () => {
      process.env.APP_ENV = 'DEV';
      process.env.FIREBASE_PROJECT_ID = 'override-value';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.FIREBASE_PROJECT_ID.DEV);
    });

    it('should fallback to process.env when non-secret variable exists but APP_ENV is invalid', () => {
      process.env.APP_ENV = 'INVALID_ENV';
      process.env.FIREBASE_PROJECT_ID = 'fallback-value';
      
      const result = getEnvVariable('FIREBASE_PROJECT_ID');
      
      expect(result).toBe('fallback-value');
    });
  });
}); 