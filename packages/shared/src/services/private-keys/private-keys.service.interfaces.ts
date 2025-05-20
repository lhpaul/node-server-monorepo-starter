import { PrivateKey } from '../../domain/models/private-key.model';

export interface ClientCache {
  privateKeys: PrivateKey[];
  fetchedAt: Date;
}

export interface PrivateKeyValidationResult {
  isValid: boolean;
}
