import { ResourceModel } from '../../definitions/domain.interfaces';

export class User implements ResourceModel {
  public readonly createdAt: Date; // Created at date
  public readonly email: string; // Email
  public readonly id: string; // User id
  public readonly updatedAt: Date; // Updated at date

  constructor(user: Required<User>) {
    Object.assign(this, user);
  }
}
