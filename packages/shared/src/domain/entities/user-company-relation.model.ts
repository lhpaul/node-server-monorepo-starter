import { EntityModel } from '../../definitions/domain.interfaces';

export enum UserCompanyRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class UserCompanyRelation implements EntityModel {
  public readonly companyId: string; // Company id
  public readonly createdAt: Date; // Created at date
  public readonly id: string; // User company relation id
  public readonly role: UserCompanyRole; // User company role
  public readonly updatedAt: Date; // Updated at date
  public readonly userId: string; // User id

  constructor(data: Required<UserCompanyRelation>) {
    this.companyId = data.companyId;
    this.createdAt = data.createdAt;
    this.id = data.id;
    this.role = data.role;
    this.updatedAt = data.updatedAt;
    this.userId = data.userId;
  }
}
