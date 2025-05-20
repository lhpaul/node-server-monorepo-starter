import { compareSync } from 'bcrypt';
import { PrivateKey } from '../../../domain/models/private-key.model';
import { PrivateKeysRepository } from '../../../repositories/private-keys/private-keys.repository';
import { API_KEYS_CACHE_EXPIRATION } from '../private-keys.service.constants';
import { PrivateKeysService } from '../private-keys.service';

jest.mock('bcrypt');
jest.mock('../../../repositories/api-keys/api-keys.repository');

describe(PrivateKeysService.name, () => {
  let service: PrivateKeysService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PrivateKeysService();
  });

  describe(PrivateKeysService.getInstance.name, () => {
    it('should return the same instance', () => {
      const instance1 = PrivateKeysService.getInstance();
      const instance2 = PrivateKeysService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(PrivateKeysService.prototype.validatePrivateKey.name, () => {
    const mockOauthClientId = 'test-client-id';
    const mockApiKeyValue = 'test-api-key';
    const mockHash = 'hashed-api-key';
    const mockDate = new Date();

    const createMockApiKey = (hash: string): PrivateKey => {
      return new PrivateKey({
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
      jest.spyOn(PrivateKeysRepository, 'getInstance').mockReturnValue({
        getApiKeys: getApiKeysMock,
      } as unknown as PrivateKeysRepository);
    });

    it('should return isValid true when matching api key is found', async () => {
      // Arrange
      const mockApiKeys = [createMockApiKey(mockHash)];
      getApiKeysMock.mockResolvedValue(mockApiKeys);
      (compareSync as jest.Mock).mockReturnValue(true);

      // Act
      const result = await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

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
      const result = await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

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
      const result = await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

      // Assert
      expect(result.isValid).toBe(false);
      expect(getApiKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      });
      expect(compareSync).not.toHaveBeenCalled();
    });

    describe('cache behavior', () => {
      it('should fetch from repository on first request', async () => {
        // Arrange
        const mockApiKeys = [createMockApiKey(mockHash)];
        getApiKeysMock.mockResolvedValue(mockApiKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

        // Assert
        expect(getApiKeysMock).toHaveBeenCalledTimes(1);
      });

      it('should use cache for subsequent requests within expiration time', async () => {
        // Arrange
        const mockApiKeys = [createMockApiKey(mockHash)];
        getApiKeysMock.mockResolvedValue(mockApiKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

        // Assert
        expect(getApiKeysMock).toHaveBeenCalledTimes(1);
      });

      it('should refetch when cache is expired', async () => {
        // Arrange
        jest.useFakeTimers();
        const mockApiKeys = [createMockApiKey(mockHash)];
        getApiKeysMock.mockResolvedValue(mockApiKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);
        
        // Move time forward past cache expiration
        jest.advanceTimersByTime(API_KEYS_CACHE_EXPIRATION + 1000);
        
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

        // Assert
        expect(getApiKeysMock).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
      });

      it('should refetch when cache is empty', async () => {
        // Arrange
        const mockApiKeys: PrivateKey[] = [];
        getApiKeysMock.mockResolvedValue(mockApiKeys);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);
        await service.validatePrivateKey(mockOauthClientId, mockApiKeyValue);

        // Assert
        expect(getApiKeysMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
