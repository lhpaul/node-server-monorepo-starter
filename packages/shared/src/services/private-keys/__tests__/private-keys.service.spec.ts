import { compareSync } from 'bcrypt';
import { PrivateKey } from '../../../domain/models/private-key.model';
import { PrivateKeysRepository } from '../../../repositories/private-keys/private-keys.repository';
import { API_KEYS_CACHE_EXPIRATION } from '../private-keys.service.constants';
import { PrivateKeysService } from '../private-keys.service';
import { ExecutionLogger } from '../../../definitions/logging.interfaces';

jest.mock('bcrypt');
jest.mock('../../../repositories/private-keys/private-keys.repository');

describe(PrivateKeysService.name, () => {
  let service: PrivateKeysService;
  let mockLogger: ExecutionLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PrivateKeysService();
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as unknown as ExecutionLogger;
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
    const mockPrivateKeyValue = 'test-private-key';
    const mockHash = 'hashed-private-key';
    const mockDate = new Date();

    const createMockPrivateKey = (hash: string): PrivateKey => {
      return new PrivateKey({
        createdAt: mockDate,
        hash,
        id: '1',
        label: 'Test Private Key',
        oauthClientId: mockOauthClientId,
        updatedAt: mockDate,
      });
    };

    let getPrivateKeysMock: jest.Mock;

    beforeEach(() => {
      getPrivateKeysMock = jest.fn();
      jest.spyOn(PrivateKeysRepository, 'getInstance').mockReturnValue({
        getDocumentsList: getPrivateKeysMock,
      } as unknown as PrivateKeysRepository);
    });

    it('should return isValid true when matching private key is found', async () => {
      // Arrange
      const mockPrivateKeys = [createMockPrivateKey(mockHash)];
      getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);
      (compareSync as jest.Mock).mockReturnValue(true);

      // Act
      const result = await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

      // Assert
      expect(result.isValid).toBe(true);
      expect(getPrivateKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      }, mockLogger);
      expect(compareSync).toHaveBeenCalledWith(mockPrivateKeyValue, mockHash);
    });

    it('should return isValid false when no matching private key is found', async () => {
      // Arrange
      const mockPrivateKeys = [createMockPrivateKey(mockHash)];
      getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);
      (compareSync as jest.Mock).mockReturnValue(false);

      // Act
      const result = await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

      // Assert
      expect(result.isValid).toBe(false);
      expect(getPrivateKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      }, mockLogger);
      expect(compareSync).toHaveBeenCalledWith(mockPrivateKeyValue, mockHash);
    });

    it('should return isValid false when no private keys are found', async () => {
      // Arrange
      getPrivateKeysMock.mockResolvedValue([]);

      // Act
      const result = await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

      // Assert
      expect(result.isValid).toBe(false);
      expect(getPrivateKeysMock).toHaveBeenCalledWith({
        oauthClientId: [{ operator: '==', value: mockOauthClientId }],
      }, mockLogger);
      expect(compareSync).not.toHaveBeenCalled();
    });

    describe('cache behavior', () => {
      it('should fetch from repository on first request', async () => {
        // Arrange
        const mockPrivateKeys = [createMockPrivateKey(mockHash)];
        getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

        // Assert
        expect(getPrivateKeysMock).toHaveBeenCalledTimes(1);
      });

      it('should use cache for subsequent requests within expiration time', async () => {
        // Arrange
        const mockPrivateKeys = [createMockPrivateKey(mockHash)];
        getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

        // Assert
        expect(getPrivateKeysMock).toHaveBeenCalledTimes(1);
      });

      it('should refetch when cache is expired', async () => {
        // Arrange
        jest.useFakeTimers();
        const mockPrivateKeys = [createMockPrivateKey(mockHash)];
        getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);
        (compareSync as jest.Mock).mockReturnValue(true);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);
        
        // Move time forward past cache expiration
        jest.advanceTimersByTime(API_KEYS_CACHE_EXPIRATION + 1000);
        
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

        // Assert
        expect(getPrivateKeysMock).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
      });

      it('should refetch when cache is empty', async () => {
        // Arrange
        const mockPrivateKeys: PrivateKey[] = [];
        getPrivateKeysMock.mockResolvedValue(mockPrivateKeys);

        // Act
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);
        await service.validatePrivateKey(mockOauthClientId, mockPrivateKeyValue, mockLogger);

        // Assert
        expect(getPrivateKeysMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
