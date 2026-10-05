// Internal modules (farthest path first, then alphabetical)
import { User } from '../../entities';
import {
  CreateUserDocumentInput,
  UserDocument,
  UserQueryInput,
  UsersRepository,
  UpdateUserDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import { UsersDocumentToEntityParser } from './users.service.classes';
import {
  CreateUserInput,
  UpdateUserInput,
  FilterUserInput,
} from './users.service.interfaces';

/**
 * Example service implementation - Replace with your actual business logic
 *
 * This is a minimal example showing the structure for domain services.
 * Replace this with your actual business logic implementations.
 */

export class UsersService extends DomainModelService<User, UserDocument, CreateUserInput, CreateUserDocumentInput, UpdateUserInput, UpdateUserDocumentInput, FilterUserInput, UserQueryInput> implements UsersService {
  private static instance: UsersService;
  public static getInstance(): UsersService {
    if (!this.instance) {
      this.instance = new UsersService(UsersRepository.getInstance(), UsersDocumentToEntityParser);
    }
    return this.instance;
  }
}
