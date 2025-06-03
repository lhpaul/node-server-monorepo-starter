import { User } from '../../domain/models/user.model';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_USERS } from './users.repository.constants';
import {
  CreateUserInput,
  GetUsersQuery,
  UpdateUserInput,
} from './users.repository.interfaces';


export class UsersRepository extends InMemoryRepository<User, CreateUserInput, UpdateUserInput, GetUsersQuery> {
  private static instance: UsersRepository;

  public static getInstance(): UsersRepository {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository(MOCK_USERS);
    }
    return UsersRepository.instance;
  }
}
