import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './users.repository.constants';
import {
  UserDocument,
  CreateUserDocumentInput,
  QueryUsersInput,
  UpdateUserDocumentInput,
} from './users.repository.interfaces';


export class UsersRepository extends FirestoreCollectionRepository<UserDocument, CreateUserDocumentInput, UpdateUserDocumentInput, QueryUsersInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: UsersRepository;
  public static getInstance(): UsersRepository {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
}
