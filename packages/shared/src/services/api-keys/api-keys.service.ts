import { compareSync } from 'bcrypt';
import { ApiKeysRepository } from '../../repositories/api-keys/api-keys.repository';
import { ApiKeyValidationResult } from './api-keys.service.interfaces';

export class ApiKeysService {
  public async validateApiKey(oauthClientId: string, apiKeyValue: string): Promise<ApiKeyValidationResult> {
    const apiKeys = await ApiKeysRepository.getInstance().getApiKeys({
      oauthClientId: [{ operator: '==', value: oauthClientId }],
    });
    const apiKey = apiKeys.find((key) => compareSync(apiKeyValue, key.hash));
    return {
      isValid: !!apiKey,
    };
  }
}
