import { UserPermissions } from '@repo/shared/domain';

export function hasCompanyReadPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'company:read' || permission === 'company:write');
}

export function hasCompanyUpdatePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'company:update' || permission === 'company:write');
}

export function hasCompanyDeletePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'company:delete' || permission === 'company:write');
}

export function hasCompanySubscriptionsReadPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'subscriptions:read');
}

export function hasCompanyTransactionsCreatePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'transactions:create' || permission === 'transactions:write');
}

export function hasCompanyTransactionsReadPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'transactions:read' || permission === 'transactions:write');
}

export function hasCompanyTransactionsUpdatePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'transactions:update' || permission === 'transactions:write');
}

export function hasCompanyTransactionsDeletePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'transactions:delete' || permission === 'transactions:write');
}

export function hasCompanyFinancialInstitutionsCreatePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:create' || permission === 'financial-institutions:write');
}

export function hasCompanyFinancialInstitutionsReadPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:read' || permission === 'financial-institutions:write');
}

export function hasCompanyFinancialInstitutionsUpdatePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:update' || permission === 'financial-institutions:write');
}

export function hasCompanyFinancialInstitutionsDeletePermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:delete' || permission === 'financial-institutions:write');
}

export function hasCompanyFinancialInstitutionsListPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:read' || permission === 'financial-institutions:write');
}

export function hasCompanyFinancialInstitutionsGetPermission(companyId: string, permissions: UserPermissions) {
  return permissions.companies?.[companyId]?.some((permission) => permission === 'financial-institutions:read' || permission === 'financial-institutions:write');
}
