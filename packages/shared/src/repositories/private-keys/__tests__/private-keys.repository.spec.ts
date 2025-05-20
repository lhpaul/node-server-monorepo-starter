import { PrivateKeysRepository } from '../private-keys.repository';
import { MOCK_PRIVATE_KEYS, ERROR_MESSAGES } from '../private-keys.repository.constants';
import {
  UpdatePrivateKeyError,
  UpdatePrivateKeyErrorCode,
  DeletePrivateKeyError,
  DeletePrivateKeyErrorCode,
} from '../private-keys.repository.errors';

describe(PrivateKeysRepository.name, () => {
  let repository: PrivateKeysRepository;
  const createApiKeyData = {
    oauthClientId: 'test-oauth-client-id',
    label: 'Test API Key',
    hash: 'test-hash',
  };

  beforeEach(() => {
    // Reset the singleton instance
    (PrivateKeysRepository as any).instance = undefined;
    repository = PrivateKeysRepository.getInstance();
  });

  describe(PrivateKeysRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = PrivateKeysRepository.getInstance();
      const instance2 = PrivateKeysRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(PrivateKeysRepository.prototype.createPrivateKey.name, () => {
    it('should create a new API key and return its id', async () => {
      const result = await repository.createPrivateKey(createApiKeyData);

      expect(result).toHaveProperty('id');
    });
  });

  describe(PrivateKeysRepository.prototype.getApiPrivateById.name, () => {
    it('should return an API key when it exists', async () => {
      const apiKey = MOCK_PRIVATE_KEYS[0];
      const fetchedKey = await repository.getApiPrivateById(apiKey.id);
      expect(fetchedKey).toEqual(apiKey);
    });

    it('should return null when API key does not exist', async () => {
      const fetchedKey = await repository.getApiPrivateById('999');
      expect(fetchedKey).toBeNull();
    });
  });

  describe(PrivateKeysRepository.prototype.getPrivateKeys.name, () => {
    it('should return all API keys when no query is provided', async () => {
      const keys = await repository.getPrivateKeys();
      expect(keys).toEqual(MOCK_PRIVATE_KEYS);
    });

    it('should filter API keys by clientId', async () => {
      const keys = await repository.getPrivateKeys({
        oauthClientId: [{ operator: '==', value: 'client-1' }],
      });
      expect(keys).toHaveLength(1);
      expect(keys[0].oauthClientId).toBe('client-1');
    });

    it('should filter API keys by label', async () => {
      const keys = await repository.getPrivateKeys({
        label: [{ operator: '==', value: 'Test API Key 1' }],
      });
      expect(keys).toHaveLength(1);
      expect(keys[0].label).toBe('Test API Key 1');
    });
  });

  describe(PrivateKeysRepository.prototype.updatePrivateKey.name, () => {
    it('should update an existing API key', async () => {
      const apiKey = MOCK_PRIVATE_KEYS[0];
      const updateData = {
        label: 'Updated Label',
        hash: 'updated-hash',
      };

      await repository.updatePrivateKey(apiKey.id, updateData);

      const updatedKey = MOCK_PRIVATE_KEYS.find((key) => key.id === apiKey.id);
      expect(updatedKey).toBeDefined();
      expect(updatedKey?.label).toBe(updateData.label);
      expect(updatedKey?.hash).toBe(updateData.hash);
    });

    it('should throw UpdateApiKeyError when API key does not exist', async () => {
      const updateData = {
        label: 'Updated Label',
      };

      try {
        await repository.updatePrivateKey('999', updateData);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdatePrivateKeyError);
        expect(error.code).toBe(UpdatePrivateKeyErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES[UpdatePrivateKeyErrorCode.DOCUMENT_NOT_FOUND]);
      }
    });
  });

  describe(PrivateKeysRepository.prototype.deletePrivateKey.name, () => {
    it('should delete an existing API key', async () => {
      const apiKey = MOCK_PRIVATE_KEYS[0];
      const initialLength = MOCK_PRIVATE_KEYS.length;

      await repository.deletePrivateKey(apiKey.id);

      expect(MOCK_PRIVATE_KEYS).toHaveLength(initialLength - 1);
      expect(MOCK_PRIVATE_KEYS.find((key) => key.id === apiKey.id)).toBeUndefined();
    });

    it('should throw DeleteApiKeyError when API key does not exist', async () => {
      try {
        await repository.deletePrivateKey('999');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeletePrivateKeyError);
        expect(error.code).toBe(DeletePrivateKeyErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES[DeletePrivateKeyErrorCode.DOCUMENT_NOT_FOUND]);
      }
    });
  });
}); 