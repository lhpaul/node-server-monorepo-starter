import { UserRole } from '@repo/shared/domain';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthUser extends DecodedIdToken, UserPermissions {
  app_user_id?: string;
}

export interface UserPermissions {
  role?: UserRole;
}


