import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';
import { UserCompanyRole } from '../../domain/models/user-company-relation.model';

export interface CreateUserCompanyRelationInput {
  companyId: string;
  userId: string;
  role: UserCompanyRole;
}

export interface UpdateUserCompanyRelationInput {
  role?: UserCompanyRole;
}

export interface GetUserCompanyRelationsQuery extends QueryInput {
  companyId?: QueryOptions<string>[];
  userId?: QueryOptions<string>[];
  role?: QueryOptions<UserCompanyRole>[];
  createdAt?: QueryOptions<Date>[];
  updatedAt?: QueryOptions<Date>[];
} 