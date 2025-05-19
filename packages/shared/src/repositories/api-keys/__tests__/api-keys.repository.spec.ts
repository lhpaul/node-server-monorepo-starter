import { ApiKeysRepository } from '../api-keys.repository';
import { MOCK_API_KEYS, ERROR_MESSAGES } from '../api-keys.repository.constants';
import {
  UpdateApiKeyError,
  UpdateApiKeyErrorCode,
  DeleteApiKeyError,
  DeleteApiKeyErrorCode,
} from '../api-keys.repository.errors';

describe(ApiKeysRepository.name, () => {
  let repository: ApiKeysRepository;
  const createApiKeyData = {
    oauthClientId: 'test-oauth-client-id',
    label: 'Test API Key',
    hash: 'test-hash',
  };

  beforeEach(() => {
    // Reset the singleton instance
    (ApiKeysRepository as any).instance = undefined;
    repository = ApiKeysRepository.getInstance();
  });

  describe(ApiKeysRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = ApiKeysRepository.getInstance();
      const instance2 = ApiKeysRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(ApiKeysRepository.prototype.createApiKey.name, () => {
    it('should create a new API key and return its id', async () => {
      const result = await repository.createApiKey(createApiKeyData);

      expect(result).toHaveProperty('id');
    });
  });

  describe(ApiKeysRepository.prototype.getApiKeyById.name, () => {
    it('should return an API key when it exists', async () => {
      const apiKey = MOCK_API_KEYS[0];
      const fetchedKey = await repository.getApiKeyById(apiKey.id);
      expect(fetchedKey).toEqual(apiKey);
    });

    it('should return null when API key does not exist', async () => {
      const fetchedKey = await repository.getApiKeyById('999');
      expect(fetchedKey).toBeNull();
    });
  });

  describe(ApiKeysRepository.prototype.getApiKeys.name, () => {
    it('should return all API keys when no query is provided', async () => {
      const keys = await repository.getApiKeys();
      expect(keys).toEqual(MOCK_API_KEYS);
    });

    it('should filter API keys by clientId', async () => {
      const keys = await repository.getApiKeys({
        oauthClientId: [{ operator: '==', value: 'client-1' }],
      });
      expect(keys).toHaveLength(1);
      expect(keys[0].oauthClientId).toBe('client-1');
    });

    it('should filter API keys by label', async () => {
      const keys = await repository.getApiKeys({
        label: [{ operator: '==', value: 'Test API Key 1' }],
      });
      expect(keys).toHaveLength(1);
      expect(keys[0].label).toBe('Test API Key 1');
    });
  });

  describe(ApiKeysRepository.prototype.updateApiKey.name, () => {
    it('should update an existing API key', async () => {
      const apiKey = MOCK_API_KEYS[0];
      const updateData = {
        label: 'Updated Label',
        hash: 'updated-hash',
      };

      await repository.updateApiKey(apiKey.id, updateData);

      const updatedKey = MOCK_API_KEYS.find((key) => key.id === apiKey.id);
      expect(updatedKey).toBeDefined();
      expect(updatedKey?.label).toBe(updateData.label);
      expect(updatedKey?.hash).toBe(updateData.hash);
    });

    it('should throw UpdateApiKeyError when API key does not exist', async () => {
      const updateData = {
        label: 'Updated Label',
      };

      try {
        await repository.updateApiKey('999', updateData);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdateApiKeyError);
        expect(error.code).toBe(UpdateApiKeyErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES[UpdateApiKeyErrorCode.DOCUMENT_NOT_FOUND]);
      }
    });
  });

  describe(ApiKeysRepository.prototype.deleteApiKey.name, () => {
    it('should delete an existing API key', async () => {
      const apiKey = MOCK_API_KEYS[0];
      const initialLength = MOCK_API_KEYS.length;

      await repository.deleteApiKey(apiKey.id);

      expect(MOCK_API_KEYS).toHaveLength(initialLength - 1);
      expect(MOCK_API_KEYS.find((key) => key.id === apiKey.id)).toBeUndefined();
    });

    it('should throw DeleteApiKeyError when API key does not exist', async () => {
      try {
        await repository.deleteApiKey('999');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeleteApiKeyError);
        expect(error.code).toBe(DeleteApiKeyErrorCode.DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES[DeleteApiKeyErrorCode.DOCUMENT_NOT_FOUND]);
      }
    });
  });
}); 