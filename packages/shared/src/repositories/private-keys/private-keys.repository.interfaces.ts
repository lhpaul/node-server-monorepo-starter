import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface PrivateKeyDocument extends DocumentModel {
  hash: string;
  label: string;
  oauthClientId: string;
}

export interface CreatePrivateKeyDocumentInput {
  oauthClientId: string;
  label: string;
  hash: string;
}

export interface UpdatePrivateKeyDocumentInput {
  label?: string;
  hash?: string;
}

export interface GetPrivateKeysQuery extends QueryInput {
  oauthClientId?: QueryItem<string>[];
  label?: QueryItem<string>[];
} 