import { getEnvironmentVariable } from '../../environment-variables';
import { getSecret } from '../secrets.utils';
import { SECRET_NOT_FOUND_ERROR_MESSAGE } from '../secrets.utils.constants';

// Mock the environment variables utility
jest.mock('../../environment-variables');

describe(getSecret.name, () => {
  const mockGetEnvironmentVariable = getEnvironmentVariable as jest.MockedFunction<
    typeof getEnvironmentVariable
  >;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when secret is found', () => {
    it('should return the secret value', () => {
      // Arrange
      const secretKey = 'API_KEY';
      const expectedSecretValue = 'test-api-key-123';
      mockGetEnvironmentVariable.mockReturnValue(expectedSecretValue);

      // Act
      const result = getSecret(secretKey);

      // Assert
      expect(result).toBe(expectedSecretValue);
      expect(mockGetEnvironmentVariable).toHaveBeenCalledWith(secretKey);
      expect(mockGetEnvironmentVariable).toHaveBeenCalledTimes(1);
    });
  });

  describe('when secret is not found', () => {
    it('should throw error with correct message when secret is undefined', () => {
      // Arrange
      const secretKey = 'MISSING_SECRET';
      mockGetEnvironmentVariable.mockReturnValue(undefined);

      // Act & Assert
      expect(() => getSecret(secretKey)).toThrow(SECRET_NOT_FOUND_ERROR_MESSAGE(secretKey));
      expect(mockGetEnvironmentVariable).toHaveBeenCalledWith(secretKey);
      expect(mockGetEnvironmentVariable).toHaveBeenCalledTimes(1);
    });
  });
}); 