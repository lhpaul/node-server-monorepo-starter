import { getEnvironmentVariable } from '../environment-variables.utils';
import { APP_ENV_NOT_SET_ERROR_MESSAGE, ENV_VARIABLES_UTILS_CONSTANTS } from '../environment-variables.utils.constants';

describe(getEnvironmentVariable.name, () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('defined variables in constants', () => {
    it('should throw error when APP_ENV is not set', () => {
      expect(() => getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT')).toThrow(APP_ENV_NOT_SET_ERROR_MESSAGE);
    });

    it('should return DEV value when APP_ENV is DEV', () => {
      process.env.APP_ENV = 'DEV';
      
      const result = getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.MOCK_TRANSACTIONS_ENDPOINT.DEV);
    });

    it('should return STG value when APP_ENV is STG', () => {
      process.env.APP_ENV = 'STG';
      
      const result = getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.MOCK_TRANSACTIONS_ENDPOINT.STG);
    });

    it('should return PROD value when APP_ENV is PROD', () => {
      process.env.APP_ENV = 'PROD';
      
      const result = getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.MOCK_TRANSACTIONS_ENDPOINT.PROD);
    });

    it('should return undefined when variable name does not exist in constants', () => {
      process.env.APP_ENV = 'DEV';
      
      const result = getEnvironmentVariable('NON_EXISTENT_VARIABLE');
      
      expect(result).toBeUndefined();
    });
  });

  describe('non-defined variables in constants', () => {
    it('should throw error when APP_ENV is not set', () => {
      expect(() => getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT')).toThrow(APP_ENV_NOT_SET_ERROR_MESSAGE);
    });

    it('should return process.env value when variable is not in constants', () => {
      process.env.APP_ENV = 'DEV';
      const secretValue = 'secret-api-key-123';
      process.env.SECRET_API_KEY = secretValue;
      
      const result = getEnvironmentVariable('SECRET_API_KEY');
      
      expect(result).toBe(secretValue);
    });

    it('should return undefined when secret variable is not set in process.env', () => {
      process.env.APP_ENV = 'DEV';
      delete process.env.SECRET_VARIABLE;
      
      const result = getEnvironmentVariable('SECRET_VARIABLE');
      
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string variable name', () => {
      process.env.APP_ENV = 'DEV';
      const result = getEnvironmentVariable('');
      
      expect(result).toBeUndefined();
    });

    it('should handle undefined variable name', () => {
      process.env.APP_ENV = 'DEV';
      const result = getEnvironmentVariable(undefined as any);
      
      expect(result).toBeUndefined();
    });

    it('should prioritize constants over process.env for non-secret variables', () => {
      process.env.APP_ENV = 'DEV';
      process.env.MOCK_TRANSACTIONS_ENDPOINT = 'override-value';
      
      const result = getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT');
      
      expect(result).toBe(ENV_VARIABLES_UTILS_CONSTANTS.MOCK_TRANSACTIONS_ENDPOINT.DEV);
      expect(result).not.toBe('override-value');
    });

    it('should handle case sensitivity correctly', () => {
      process.env.APP_ENV = 'dev'; // lowercase
      
      const result = getEnvironmentVariable('MOCK_TRANSACTIONS_ENDPOINT');
      
      expect(result).toBeUndefined();
    });
  });
}); 