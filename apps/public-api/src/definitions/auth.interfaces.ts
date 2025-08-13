export interface AuthUser extends UserPermissions {
  app_user_id?: string;
}

export interface UserPermissions {
  companies: { [companyId: string]: string[] };
}


