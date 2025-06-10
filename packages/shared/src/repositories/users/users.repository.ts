
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_USERS } from './users.repository.constants';
import {
  UserDocument,
  CreateUserDocumentInput,
  QueryUsersInput,
  UpdateUserDocumentInput,
} from './users.repository.interfaces';


export class UsersRepository extends InMemoryRepository<UserDocument, CreateUserDocumentInput, UpdateUserDocumentInput, QueryUsersInput> {
  private static instance: UsersRepository;

  public static getInstance(): UsersRepository {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository(MOCK_USERS);
    }
    return UsersRepository.instance;
  }
}
