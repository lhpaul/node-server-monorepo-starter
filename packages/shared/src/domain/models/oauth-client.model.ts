import { ResourceModel } from '../../definitions/domain.interfaces';

export class OAuthClient implements ResourceModel {
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the oauth client
  public readonly name: string; // name of the oauth client
  public readonly updatedAt: Date; // date of last update
  constructor(oauthClient: Required<OAuthClient>) {
    Object.assign(this, oauthClient);
  }
}
