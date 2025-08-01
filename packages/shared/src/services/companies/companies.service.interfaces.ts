import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface AddFinancialInstitutionInput {
  credentials: any; // should be type JSON
  financialInstitutionId: string;
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
  credentials: any; // should be type JSON
  financialInstitutionRelationId: string;
}

export interface UpdateCompanyInput {
  name?: string;
}

export interface GetFinancialInstitutionRelationInput {
  financialInstitutionId: string;
}

export interface CompanyFinancialInstitution {
  companyId: string;
  createdAt: Date;
  credentials: any; // decrypted credentials as JSON
  financialInstitution: {
    id: string;
    name: string;
  };
  id: string;
  updatedAt: Date;
}
