export interface ValidateCredentialsInput {
  email: string;
  password: string;
}

export interface UserPermissions {
  companies: { [companyId: string]: string[] };
}
