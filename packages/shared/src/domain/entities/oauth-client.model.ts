import { EntityModel } from '../../definitions/domain.interfaces';

export class OAuthClient implements EntityModel {
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the oauth client
  public readonly name: string; // name of the oauth client
  public readonly updatedAt: Date; // date of last update
  constructor(data: Required<OAuthClient>) {
    this.createdAt = data.createdAt;
    this.id = data.id;
    this.name = data.name;
    this.updatedAt = data.updatedAt;
  }
}
