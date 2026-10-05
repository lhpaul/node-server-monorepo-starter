import { FirestoreCollectionRepository } from '../../utils/repositories/firestore-collection-repository.class';
import { COLLECTION_PATH } from './users.repository.constants';
import { UserDocument, CreateUserDocumentInput, UpdateUserDocumentInput, UserQueryInput } from './users.repository.interfaces.js';

export class UsersRepository extends FirestoreCollectionRepository<UserDocument, CreateUserDocumentInput, UpdateUserDocumentInput, UserQueryInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: UsersRepository;
  public static getInstance(): UsersRepository {
    if (!this.instance) {
      this.instance = new UsersRepository();
    }
    return this.instance;
  }
  constructor() {
    super({ collectionPath: COLLECTION_PATH });
  }
}