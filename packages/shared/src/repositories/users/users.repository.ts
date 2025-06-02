import { User } from '../../domain/models/user.model';
import { COLLECTION_PATH } from './users.repository.constants';
import {
  CreateUserInput,
  GetUsersQuery,
  UpdateUserInput,
} from './users.repository.interfaces';
import { FirestoreCollectionRepository } from '../../utils/firestore/firestore-collection-repository.class';

export class UsersRepository extends FirestoreCollectionRepository<User, CreateUserInput, UpdateUserInput, GetUsersQuery> {
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