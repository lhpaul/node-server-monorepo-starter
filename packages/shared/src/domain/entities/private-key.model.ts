import { EntityModel } from '../../definitions/domain.interfaces';
export class PrivateKey implements EntityModel {
  public readonly createdAt: Date; // date of creation
  public readonly hash: string; // hash of the api key
  public readonly id: string; // id of the api key
  public readonly label: string; // label of the api key
  public readonly oauthClientId: string; // id of the oauth client
  public readonly updatedAt: Date; // date of last update
  constructor(apiKey: Required<PrivateKey>) {
    Object.assign(this, apiKey);
  }
}
