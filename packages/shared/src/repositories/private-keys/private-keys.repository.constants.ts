import { PrivateKeyDocument } from './private-keys.repository.interfaces';

export const MOCK_PRIVATE_KEYS: PrivateKeyDocument[] = [
  {
    oauthClientId: 'client-1',
    createdAt: new Date(),
    id: '1',
    label: 'Test Private Key 1',
    updatedAt: new Date(),
    hash: '$2a$10$kuMZHrLq/0NVo4Yfx5uuOOQONiRhfKRNchpEBC41lyXivpeRhsLna', // hash of 'private-key-1'
  },
  {
    oauthClientId: 'client-2',
    createdAt: new Date(),
    id: '2',
    label: 'Test Private Key 2',
    updatedAt: new Date(),
    hash: '$2a$10$VY6HfnfxXZklNF8.5IceReeoWSf7F.AzKhKOYGmWTzfqIWhndL2yW', // hash of 'private-key-2'
  },
];