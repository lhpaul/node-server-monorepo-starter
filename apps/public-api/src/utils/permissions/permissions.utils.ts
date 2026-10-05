import { UserRole } from '@repo/shared/domain';
import { UserPermissions } from '../../definitions/auth.interfaces';

export function hasExamplesCreatePermission(permissions: UserPermissions) {
  return permissions.role === UserRole.ADMIN;
}

export function hasExamplesReadPermission(permissions: UserPermissions) {
  return permissions.role === UserRole.ADMIN || permissions.role === UserRole.VIEWER;
}

export function hasExamplesUpdatePermission(permissions: UserPermissions) {
  return permissions.role === UserRole.ADMIN;
}

export function hasExamplesDeletePermission(permissions: UserPermissions) {
  return permissions.role === UserRole.ADMIN;
}
