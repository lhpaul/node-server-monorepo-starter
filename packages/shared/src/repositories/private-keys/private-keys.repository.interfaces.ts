import { IQueryInput, IQueryOptions } from '../../definitions/listing.interfaces';

export interface CreatePrivateKeyInput {
  oauthClientId: string;
  label: string;
  hash: string;
}

export interface UpdatePrivateKeyInput {
  label?: string;
  hash?: string;
}

export interface GetPrivateKeysQuery extends IQueryInput {
  oauthClientId?: IQueryOptions<string>[];
  label?: IQueryOptions<string>[];
} 