import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';

export interface CreateUserBody {
  email: string;
  currentPasswordHash: string;
}

export interface UpdateUserBody {
  email?: string;
  currentPasswordHash?: string;
}

export interface GetUsersQuery extends QueryInput {
  email?: QueryOptions<string>[];
  createdAt?: QueryOptions<Date>[];
  updatedAt?: QueryOptions<Date>[];
} 