import {
  DocumentModel,
  QueryInput,
  QueryItem,
} from '../../definitions/repositories.interfaces';

export interface UserDocument extends DocumentModel {
  email: string;
  role: string;
}

export interface CreateUserDocumentInput {
  email: string;
  role: string;
}

export interface UpdateUserDocumentInput {
  email?: string;
  role?: string;
}

export interface UserQueryInput extends QueryInput {
  email?: QueryItem<string>[];
  role?: QueryItem<string>[];
}