import { UserPermissions } from '@repo/shared/services';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthUser extends DecodedIdToken, UserPermissions {}
