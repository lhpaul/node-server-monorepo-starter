import { PrivateKey } from '../private-key.model';

describe(PrivateKey.name, () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  
  const mockApiKeyData = {
    oauthClientId: 'test-oauth-client-id',
    createdAt: mockDate,
    id: 'test-api-key-id',
    label: 'Test API Key',
    updatedAt: mockDate,
    hash: 'hashed-api-key-value',
  };

  it('should initialize with correct values', () => {
    const apiKey = new PrivateKey(mockApiKeyData);

    expect(apiKey.oauthClientId).toBe(mockApiKeyData.oauthClientId);
    expect(apiKey.createdAt).toBe(mockApiKeyData.createdAt);
    expect(apiKey.id).toBe(mockApiKeyData.id);
    expect(apiKey.label).toBe(mockApiKeyData.label);
    expect(apiKey.updatedAt).toBe(mockApiKeyData.updatedAt);
    expect(apiKey.hash).toBe(mockApiKeyData.hash);
  });

});
