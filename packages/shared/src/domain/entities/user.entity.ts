import { EntityModel } from '../../definitions/domain.interfaces';

export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export class User implements EntityModel {
  public readonly createdAt: Date;
  public readonly email: string;
  public readonly id: string;
  public readonly role: UserRole;
  public readonly updatedAt: Date;
  constructor(data: Required<User>) {
    this.createdAt = data.createdAt;
    this.email = data.email;
    this.id = data.id;
    this.role = data.role;
    this.updatedAt = data.updatedAt;
  }
}