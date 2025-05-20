import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';

export interface CreatePrivateKeyBody {
  oauthClientId: string;
  label: string;
  hash: string;
}

export interface UpdatePrivateKeyBody {
  label?: string;
  hash?: string;
}

export interface GetPrivateKeysQuery extends QueryInput {
  oauthClientId?: QueryOptions<string>[];
  label?: QueryOptions<string>[];
} 