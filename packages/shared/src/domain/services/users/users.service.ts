// Internal modules (farthest path first, then alphabetical)
import { User } from '../..';
import {
  UsersRepository,
  UserDocument,
  CreateUserDocumentInput,
  QueryUsersInput,
  UpdateUserDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateUserInput,
  UpdateUserInput,
  FilterUsersInput,
} from './users.service.interfaces';

export class UsersService extends DomainModelService<User, UserDocument, CreateUserInput, CreateUserDocumentInput, UpdateUserInput, UpdateUserDocumentInput, FilterUsersInput, QueryUsersInput> {
  private static instance: UsersService;

  public static getInstance(): UsersService {
    if (!this.instance) {
      this.instance = new UsersService(UsersRepository.getInstance(), User);
    }
    return this.instance;
  }
} 