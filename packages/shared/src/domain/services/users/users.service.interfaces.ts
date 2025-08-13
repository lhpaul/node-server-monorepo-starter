import { FilterInput, FilterItem } from '../../../definitions';

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
}

export interface FilterUsersInput extends FilterInput {
  email?: FilterItem<string>[];
} 