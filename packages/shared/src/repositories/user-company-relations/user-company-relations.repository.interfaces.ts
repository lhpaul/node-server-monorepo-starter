import { QueryInput, QueryItem } from '../../definitions/listing.interfaces';
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
  companyId?: QueryItem<string>[];
  userId?: QueryItem<string>[];
  role?: QueryItem<UserCompanyRole>[];
  createdAt?: QueryItem<Date>[];
  updatedAt?: QueryItem<Date>[];
} 