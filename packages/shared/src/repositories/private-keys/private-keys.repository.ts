import { PrivateKey } from '../../domain/models/private-key.model';
import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './private-keys.repository.constants';
import {
  CreatePrivateKeyDocumentInput,
  GetPrivateKeysQuery,
  UpdatePrivateKeyDocumentInput,
} from './private-keys.repository.interfaces';


export class PrivateKeysRepository extends FirestoreCollectionRepository<PrivateKey, CreatePrivateKeyDocumentInput, UpdatePrivateKeyDocumentInput, GetPrivateKeysQuery> {
  private static instance: PrivateKeysRepository;

  public static getInstance(): PrivateKeysRepository {
    if (!PrivateKeysRepository.instance) {
      PrivateKeysRepository.instance = new PrivateKeysRepository();
    }
    return PrivateKeysRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 
