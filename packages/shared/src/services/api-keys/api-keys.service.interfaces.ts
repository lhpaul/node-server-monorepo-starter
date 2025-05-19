import { ApiKey } from '../../domain/models/api-key.model';

export interface ClientCache {
  apiKeys: ApiKey[];
  fetchedAt: Date;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
}
