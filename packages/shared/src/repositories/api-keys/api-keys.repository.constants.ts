import { ApiKey } from '../../domain/models/api-key.model';

export const MOCK_API_KEYS: ApiKey[] = [
  new ApiKey({
    oauthClientId: 'client-1',
    createdAt: new Date(),
    id: '1',
    label: 'Test API Key 1',
    updatedAt: new Date(),
    hash: '$2a$10$gBn9mUlnp.6kEe0WXpPIxOAMaC4Ju454AW9yAU.k2aCR9en8SuSvu', // hash of 'api-key-1'
  }),
  new ApiKey({
    oauthClientId: 'client-2',
    createdAt: new Date(),
    id: '2',
    label: 'Test API Key 2',
    updatedAt: new Date(),
    hash: '$2a$10$P1ULGBCt3WsrJOz/UlIV2OBeb/jyYQzMYdMTY5Li2ABw0oNtrvMeW', // hash of 'api-key-2'
  }),
];

export const ERROR_MESSAGES = {
  DOCUMENT_NOT_FOUND: 'API key not found',
};
