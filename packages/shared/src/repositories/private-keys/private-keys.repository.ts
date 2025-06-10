import { PrivateKey } from '../../domain/models/private-key.model';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_PRIVATE_KEYS } from './private-keys.repository.constants';
import {
  CreatePrivateKeyDocumentInput,
  GetPrivateKeysQuery,
  UpdatePrivateKeyDocumentInput,
} from './private-keys.repository.interfaces';


export class PrivateKeysRepository extends InMemoryRepository<PrivateKey, CreatePrivateKeyDocumentInput, UpdatePrivateKeyDocumentInput, GetPrivateKeysQuery> {
  private static instance: PrivateKeysRepository;

  public static getInstance(): PrivateKeysRepository {
    if (!PrivateKeysRepository.instance) {
      PrivateKeysRepository.instance = new PrivateKeysRepository(MOCK_PRIVATE_KEYS);
    }
    return PrivateKeysRepository.instance;
  }
}
