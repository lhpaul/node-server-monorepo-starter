import { UserCompanyRole } from '@repo/shared/domain';

export enum UserCompanyPermission {
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  COMPANY_WRITE = 'company:write',
  COMPANY_FINANCIAL_INSTITUTIONS_READ = 'financial-institutions:read',
  COMPANY_FINANCIAL_INSTITUTIONS_UPDATE = 'financial-institutions:update',
  COMPANY_FINANCIAL_INSTITUTIONS_DELETE = 'financial-institutions:delete',
  COMPANY_FINANCIAL_INSTITUTIONS_WRITE = 'financial-institutions:write',
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
    UserCompanyPermission.COMPANY_FINANCIAL_INSTITUTIONS_WRITE,
  ],
  [UserCompanyRole.MEMBER]: [
    UserCompanyPermission.COMPANY_READ,
    UserCompanyPermission.COMPANY_TRANSACTIONS_READ,
  ],
};