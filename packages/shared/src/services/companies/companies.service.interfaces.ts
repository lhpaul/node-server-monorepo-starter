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

export interface UpdateCompanyInput {
  name?: string;
}
