import { DatabaseObject } from '../../definitions/database.interfaces';

export class User implements DatabaseObject {
  public readonly createdAt: Date; // Created at date
  public readonly currentPasswordHash: string; // Current password hash
  public readonly email: string; // Email
  public readonly id: string; // User id
  public readonly updatedAt: Date; // Updated at date

  constructor(user: Required<User>) {
    Object.assign(this, user);
  }
}
