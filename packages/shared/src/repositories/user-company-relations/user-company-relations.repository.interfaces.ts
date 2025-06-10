import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface UserCompanyRelationDocument extends DocumentModel {
  companyId: string;
  userId: string;
  role: string;
}

export interface CreateUserCompanyRelationDocumentInput {
  companyId: string;
  userId: string;
  role: string;
}

export interface UpdateUserCompanyRelationDocumentInput {
  role?: string;
}

export interface QueryUserCompanyRelationsInput extends QueryInput {
  companyId?: QueryItem<string>[];
  userId?: QueryItem<string>[];
  role?: QueryItem<string>[];
  createdAt?: QueryItem<Date>[];
  updatedAt?: QueryItem<Date>[];
} 