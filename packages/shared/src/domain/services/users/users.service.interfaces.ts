import { FilterInput, FilterItem  } from '../../../definitions/domain.interfaces';
import { UserRole } from '../../entities/user.entity';

export interface CreateUserInput {
  email: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  role?: UserRole;
}

export interface FilterUserInput extends FilterInput  {
  email?: FilterItem<string>[];
  role?: FilterItem<UserRole>[];
}
