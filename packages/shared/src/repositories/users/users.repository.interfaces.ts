import { QueryInput, QueryItem } from '../../definitions/listing.interfaces';

export interface CreateUserInput {
  email: string;
  currentPasswordHash: string;
}

export interface UpdateUserInput {
  email?: string;
  currentPasswordHash?: string;
}

export interface GetUsersQuery extends QueryInput {
  email?: QueryItem<string>[];
  createdAt?: QueryItem<Date>[];
  updatedAt?: QueryItem<Date>[];
} 