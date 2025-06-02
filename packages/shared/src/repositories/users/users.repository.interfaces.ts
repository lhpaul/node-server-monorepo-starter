import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';

export interface CreateUserInput {
  email: string;
  currentPasswordHash: string;
}

export interface UpdateUserInput {
  email?: string;
  currentPasswordHash?: string;
}

export interface GetUsersQuery extends QueryInput {
  email?: QueryOptions<string>[];
  createdAt?: QueryOptions<Date>[];
  updatedAt?: QueryOptions<Date>[];
} 