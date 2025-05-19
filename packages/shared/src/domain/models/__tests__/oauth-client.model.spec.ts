import { OAuthClient } from '../oauth-client.model';

describe(OAuthClient.name, () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  
  const mockOAuthClientData = {
    createdAt: mockDate,
    id: 'test-oauth-client-id',
    name: 'Test OAuth Client',
    updatedAt: mockDate
  };

  it('should initialize with correct values', () => {
    const oauthClient = new OAuthClient(mockOAuthClientData);

    expect(oauthClient.createdAt).toBe(mockOAuthClientData.createdAt);
    expect(oauthClient.id).toBe(mockOAuthClientData.id);
    expect(oauthClient.name).toBe(mockOAuthClientData.name);
    expect(oauthClient.updatedAt).toBe(mockOAuthClientData.updatedAt);
  });
});
