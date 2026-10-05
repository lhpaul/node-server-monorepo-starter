import { UserDocument } from '../../../repositories';
import { User, UserRole } from '../../entities';
import { ERRORS_MESSAGES } from './user.services.constants';

export class UsersDocumentToEntityParser extends User {
  constructor(data: UserDocument) {
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new Error(ERRORS_MESSAGES.INVALID_USER_ROLE(data.role, data.id));
    }
    super({
      ...data,
      role: data.role as UserRole,
    });
  }
}