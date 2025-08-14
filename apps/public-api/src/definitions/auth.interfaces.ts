import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthUser extends DecodedIdToken, UserPermissions {
  app_user_id?: string;
}

export interface UserPermissions {
  companies?: { [companyId: string]: string[] };
}


