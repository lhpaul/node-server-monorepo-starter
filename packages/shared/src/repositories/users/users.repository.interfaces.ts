import { IQueryInput, IQueryOptions } from '../../definitions/listing.interfaces';

export interface CreateUserInput {
  email: string;
  currentPasswordHash: string;
}

export interface UpdateUserInput {
  email?: string;
  currentPasswordHash?: string;
}

export interface GetUsersQuery extends IQueryInput {
  email?: IQueryOptions<string>[];
  createdAt?: IQueryOptions<Date>[];
  updatedAt?: IQueryOptions<Date>[];
} 