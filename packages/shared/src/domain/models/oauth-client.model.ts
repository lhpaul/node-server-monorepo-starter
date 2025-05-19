import { DatabaseObject } from '../../definitions/database.interfaces';

export class OAuthClient implements DatabaseObject {
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the oauth client
  public readonly name: string; // name of the oauth client
  public readonly updatedAt: Date; // date of last update
  constructor(oauthClient: Required<OAuthClient>) {
    Object.assign(this, oauthClient);
  }
}
