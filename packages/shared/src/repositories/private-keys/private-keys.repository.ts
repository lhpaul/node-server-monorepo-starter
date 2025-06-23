import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './private-keys.repository.constants';
import {
  PrivateKeyDocument,
  CreatePrivateKeyDocumentInput,
  GetPrivateKeysQuery,
  UpdatePrivateKeyDocumentInput,
} from './private-keys.repository.interfaces';


export class PrivateKeysRepository extends FirestoreCollectionRepository<PrivateKeyDocument, CreatePrivateKeyDocumentInput, UpdatePrivateKeyDocumentInput, GetPrivateKeysQuery> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
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
