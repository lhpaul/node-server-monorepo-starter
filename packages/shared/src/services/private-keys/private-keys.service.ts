import { compareSync } from 'bcrypt';
import { PrivateKeysRepository } from '../../repositories/private-keys/private-keys.repository';
import { API_KEYS_CACHE_EXPIRATION } from './private-keys.service.constants';
import { PrivateKeyValidationResult, ClientCache } from './private-keys.service.interfaces';
export class PrivateKeysService {
  private static instance: PrivateKeysService;
  private cache: {[oauthClientId: string]: ClientCache} = {}; // to avoid fetching private keys from the database on each request
  public static getInstance(): PrivateKeysService {
    if (!PrivateKeysService.instance) {
      PrivateKeysService.instance = new PrivateKeysService();
    }
    return PrivateKeysService.instance;
  }
  public async validatePrivateKey(oauthClientId: string, privateKeyValue: string): Promise<PrivateKeyValidationResult> {
    if (!this.cache[oauthClientId] || this.cache[oauthClientId].fetchedAt < new Date(Date.now() - API_KEYS_CACHE_EXPIRATION) || this.cache[oauthClientId].privateKeys.length === 0) {
      this.cache[oauthClientId] = {
        privateKeys: await PrivateKeysRepository.getInstance().getPrivateKeys({
          oauthClientId: [{ operator: '==', value: oauthClientId }],
        }),
        fetchedAt: new Date(),
      };
    }
    const privateKeys = this.cache[oauthClientId].privateKeys;
    const privateKey = privateKeys.find((key) => compareSync(privateKeyValue, key.hash));
    return {
      isValid: !!privateKey,
    };
  }
}
