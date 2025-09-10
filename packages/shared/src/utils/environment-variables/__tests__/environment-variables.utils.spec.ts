import { ENV_VALUES, ENV_VARIABLES_KEYS } from '../../../constants';
import { APP_ENV_NOT_SET_ERROR_MESSAGE } from '../environment-variables.utils.constants';
import { getEnvironmentVariable } from '../environment-variables.utils';

const ENV_VARIABLE_KEYS_MOCK = 'SOME_VALUE';

jest.mock('../../../constants', () => ({
  ENV_VALUES: {
    SOME_VALUE: {
      DEV: 'some-value-dev',
      STG: 'some-value-stg',
      PROD: 'some-value-prod',
    },
  },
  ENV_VARIABLES_KEYS: {
    APP_ENV: 'APP_ENV',
    SOME_VALUE: 'SOME_VALUE',
  },
}));

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
      expect(() => getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK)).toThrow(APP_ENV_NOT_SET_ERROR_MESSAGE);
    });

    it('should return DEV value when APP_ENV is DEV', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      
      const result = getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK);
      
      expect(result).toBe(ENV_VALUES[ENV_VARIABLE_KEYS_MOCK].DEV);
    });

    it('should return STG value when APP_ENV is STG', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'STG';
      
      const result = getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK);
      
      expect(result).toBe(ENV_VALUES[ENV_VARIABLE_KEYS_MOCK].STG);
    });

    it('should return PROD value when APP_ENV is PROD', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'PROD';
      
      const result = getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK);
      
      expect(result).toBe(ENV_VALUES[ENV_VARIABLE_KEYS_MOCK].PROD);
    });

    it('should return undefined when variable name does not exist in constants', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      
      const result = getEnvironmentVariable('NON_EXISTENT_VARIABLE');
      
      expect(result).toBeUndefined();
    });
  });

  describe('non-defined variables in constants', () => {
    const nonExistentVariable = 'NON_EXISTENT_VARIABLE';
    it('should throw error when APP_ENV is not set', () => {
      expect(() => getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK)).toThrow(APP_ENV_NOT_SET_ERROR_MESSAGE);
    });

    it('should return process.env value when variable is not in constants', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      const secretValue = 'secret-api-key-123';
      process.env[nonExistentVariable] = secretValue;
      
      const result = getEnvironmentVariable(nonExistentVariable);
      
      expect(result).toBe(secretValue);
    });

    it('should return undefined when secret variable is not set in process.env', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      delete process.env[nonExistentVariable];
      
      const result = getEnvironmentVariable(nonExistentVariable);
      
      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string variable name', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      const result = getEnvironmentVariable('');
      
      expect(result).toBeUndefined();
    });

    it('should handle undefined variable name', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      const result = getEnvironmentVariable(undefined as any);
      
      expect(result).toBeUndefined();
    });

    it('should prioritize constants over process.env for non-secret variables', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'DEV';
      process.env[ENV_VARIABLE_KEYS_MOCK] = 'override-value';
      
      const result = getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK);
      
      expect(result).toBe(ENV_VALUES[ENV_VARIABLE_KEYS_MOCK].DEV);
      expect(result).not.toBe('override-value');
    });

    it('should handle case sensitivity correctly', () => {
      process.env[ENV_VARIABLES_KEYS.APP_ENV] = 'dev'; // lowercase
      
      const result = getEnvironmentVariable(ENV_VARIABLE_KEYS_MOCK);
      
      expect(result).toBeUndefined();
    });
  });
}); 