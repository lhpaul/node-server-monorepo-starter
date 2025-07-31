import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface AddFinancialInstitutionInput {
  financialInstitutionId: string;
  credentials: any; // should be type JSON
}

export interface CreateCompanyInput {
  name: string;
}

export interface FilterCompaniesInput extends FilterInput {
  name?: FilterItem<string>[];
}

export interface RemoveFinancialInstitutionInput {
  financialInstitutionId: string;
}

export interface UpdateCompanyFinancialInstitutionInput {
  financialInstitutionId: string;
  credentials: any; // should be type JSON
}

export interface UpdateCompanyInput {
  name?: string;
}

export interface GetFinancialInstitutionRelationInput {
  financialInstitutionId: string;
}

export interface CompanyFinancialInstitutionRelationWithDecryptedCredentials {
  companyId: string;
  createdAt: Date;
  credentials: any; // decrypted credentials as JSON
  financialInstitutionId: string;
  id: string;
  updatedAt: Date;
}
