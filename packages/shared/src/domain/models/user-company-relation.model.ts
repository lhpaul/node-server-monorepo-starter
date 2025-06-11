import { ResourceModel } from '../../definitions/domain.interfaces';

export enum UserCompanyRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum UserCompanyPermission {
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  COMPANY_WRITE = 'company:write',
  COMPANY_SUBSCRIPTIONS_READ = 'subscriptions:read',
  COMPANY_TRANSACTIONS_READ = 'transactions:read',
  COMPANY_TRANSACTIONS_UPDATE = 'transactions:update',
  COMPANY_TRANSACTIONS_DELETE = 'transactions:delete',
  COMPANY_TRANSACTIONS_WRITE = 'transactions:write',
}

export const PERMISSIONS_BY_ROLE: Record<UserCompanyRole, UserCompanyPermission[]> = {
  [UserCompanyRole.ADMIN]: [
    UserCompanyPermission.COMPANY_WRITE,
    UserCompanyPermission.COMPANY_SUBSCRIPTIONS_READ,
    UserCompanyPermission.COMPANY_TRANSACTIONS_WRITE,
  ],
  [UserCompanyRole.MEMBER]: [
    UserCompanyPermission.COMPANY_READ,
    UserCompanyPermission.COMPANY_TRANSACTIONS_READ,
  ],
};

export class UserCompanyRelation implements ResourceModel {
  public readonly companyId: string; // Company id
  public readonly createdAt: Date; // Created at date
  public readonly id: string; // User company relation id
  public readonly updatedAt: Date; // Updated at date
  public readonly userId: string; // User id
  public readonly role: UserCompanyRole; // User company role

  constructor(userCompanyRelation: Required<UserCompanyRelation>) {
    Object.assign(this, userCompanyRelation);
  }
}
