import { DatabaseObject } from '../../definitions/database.interfaces';
export class ApiKey implements DatabaseObject {
  public readonly createdAt: Date; // date of creation
  public readonly hash: string; // hash of the api key
  public readonly id: string; // id of the api key
  public readonly label: string; // label of the api key
  public readonly oauthClientId: string; // id of the oauth client
  public readonly updatedAt: Date; // date of last update
  constructor(apiKey: Required<ApiKey>) {
    Object.assign(this, apiKey);
  }
}
