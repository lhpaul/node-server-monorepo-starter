import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';

export interface CreateApiKeyBody {
  oauthClientId: string;
  label: string;
  hash: string;
}

export interface UpdateApiKeyBody {
  label?: string;
  hash?: string;
}

export interface GetApiKeysQuery extends QueryInput {
  oauthClientId?: QueryOptions<string>[];
  label?: QueryOptions<string>[];
} 