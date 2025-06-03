import { IQueryInput, IQueryOptions } from '../../definitions/listing.interfaces';
import { UserCompanyRole } from '../../domain/models/user-company-relation.model';

export interface CreateUserCompanyRelationInput {
  companyId: string;
  userId: string;
  role: UserCompanyRole;
}

export interface UpdateUserCompanyRelationInput {
  role?: UserCompanyRole;
}

export interface GetUserCompanyRelationsQuery extends IQueryInput {
  companyId?: IQueryOptions<string>[];
  userId?: IQueryOptions<string>[];
  role?: IQueryOptions<UserCompanyRole>[];
  createdAt?: IQueryOptions<Date>[];
  updatedAt?: IQueryOptions<Date>[];
} 