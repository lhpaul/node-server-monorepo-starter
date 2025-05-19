import { compareSync } from 'bcrypt';
import { ApiKey } from '../../../domain/models/api-key.model';
import { ApiKeysRepository } from '../../../repositories/api-keys/api-keys.repository';
import { ApiKeysService } from '../api-keys.service';

jest.mock('bcrypt');
jest.mock('../../../repositories/api-keys/api-keys.repository');

describe(ApiKeysService.name, () => {
  let service: ApiKeysService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ApiKeysService();
  });

  describe(ApiKeysService.prototype.validateApiKey.name, () => {
    const mockOauthClientId = 'test-client-id';
    const mockApiKeyValue = 'test-api-key';
    const mockHash = 'hashed-api-key';
    const mockDate = new Date();

    const createMockApiKey = (hash: string): ApiKey => {
      return new ApiKey({
        createdAt: mockDate,
        hash,
        id: '1',
        label: 'Test API Key',
        oauthClientId: mockOauthClientId,
        updatedAt: mockDate,
      });
    };

    let getApiKeysMock: jest.Mock;

    beforeEach(() => {
      getApiKeysMock = jest.fn();
      jest.spyOn(ApiKeysRepository, 'getInstance').mockReturnValue({
        getApiKeys: getApiKeysMock,
      } as unknown as ApiKeysRepository);
    });

    it('should return isValid true when matching api key is found', async () => {
      // Arrange
      const mockApiKeys = [createMockApiKey(mockHash)];
      getApiKeysMock.mockResolvedValue(mockApiKeys);
      (compareSync as jest.Mock).mockReturnValue(true);

      // Act
      const result = await service.validateApiKey(mockOauthClientId, mockApiKeyValue);

      // Assert
      expect(result.isValid).toBe(true);
      expect(getApiKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      });
      expect(compareSync).toHaveBeenCalledWith(mockApiKeyValue, mockHash);
    });

    it('should return isValid false when no matching api key is found', async () => {
      // Arrange
      const mockApiKeys = [createMockApiKey(mockHash)];
      getApiKeysMock.mockResolvedValue(mockApiKeys);
      (compareSync as jest.Mock).mockReturnValue(false);

      // Act
      const result = await service.validateApiKey(mockOauthClientId, mockApiKeyValue);

      // Assert
      expect(result.isValid).toBe(false);
      expect(getApiKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      });
      expect(compareSync).toHaveBeenCalledWith(mockApiKeyValue, mockHash);
    });

    it('should return isValid false when no api keys are found', async () => {
      // Arrange
      getApiKeysMock.mockResolvedValue([]);

      // Act
      const result = await service.validateApiKey(mockOauthClientId, mockApiKeyValue);

      // Assert
      expect(result.isValid).toBe(false);
      expect(getApiKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      });
      expect(compareSync).not.toHaveBeenCalled();
    });
  });
});
