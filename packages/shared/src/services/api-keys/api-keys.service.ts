import { compareSync } from 'bcrypt';
import { ApiKeysRepository } from '../../repositories/api-keys/api-keys.repository';
import { API_KEYS_CACHE_EXPIRATION } from './api-keys.service.constants';
import { ApiKeyValidationResult, ClientCache } from './api-keys.service.interfaces';
export class ApiKeysService {
  private cache: {[oauthClientId: string]: ClientCache} = {}; // to avoid fetching api keys from the database on each request
  public async validateApiKey(oauthClientId: string, apiKeyValue: string): Promise<ApiKeyValidationResult> {
    if (!this.cache[oauthClientId] || this.cache[oauthClientId].fetchedAt < new Date(Date.now() - API_KEYS_CACHE_EXPIRATION) || this.cache[oauthClientId].apiKeys.length === 0) {
      this.cache[oauthClientId] = {
        apiKeys: await ApiKeysRepository.getInstance().getApiKeys({
          oauthClientId: [{ operator: '==', value: oauthClientId }],
        }),
        fetchedAt: new Date(),
      };
    }
    const apiKeys = this.cache[oauthClientId].apiKeys;
    const apiKey = apiKeys.find((key) => compareSync(apiKeyValue, key.hash));
    return {
      isValid: !!apiKey,
    };
  }
}
