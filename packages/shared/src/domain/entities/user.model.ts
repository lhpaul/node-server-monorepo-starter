import { EntityModel } from '../../definitions/domain.interfaces';

export class User implements EntityModel {
  public readonly createdAt: Date; // Created at date
  public readonly email: string; // Email
  public readonly id: string; // User id
  public readonly updatedAt: Date; // Updated at date

  constructor(data: Required<User>) {
    this.createdAt = data.createdAt;
    this.email = data.email;
    this.id = data.id;
    this.updatedAt = data.updatedAt;
  }
}
