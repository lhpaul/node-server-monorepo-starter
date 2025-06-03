import { QueryInput, QueryItem } from '../../definitions/listing.interfaces';

export interface CreatePrivateKeyInput {
  oauthClientId: string;
  label: string;
  hash: string;
}

export interface UpdatePrivateKeyInput {
  label?: string;
  hash?: string;
}

export interface GetPrivateKeysQuery extends QueryInput {
  oauthClientId?: QueryItem<string>[];
  label?: QueryItem<string>[];
} 