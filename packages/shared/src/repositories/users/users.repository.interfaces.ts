import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface UserDocument extends DocumentModel {
  email: string;
  currentPasswordHash: string;
}

export interface CreateUserDocumentInput {
  email: string;
  currentPasswordHash: string;
}

export interface UpdateUserDocumentInput {
  email?: string;
  currentPasswordHash?: string;
}

export interface QueryUsersInput extends QueryInput {
  email?: QueryItem<string>[];
  createdAt?: QueryItem<Date>[];
  updatedAt?: QueryItem<Date>[];
} 