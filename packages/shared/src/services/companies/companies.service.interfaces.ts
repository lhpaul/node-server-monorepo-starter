import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface CreateCompanyInput {
  name: string;
}

export interface UpdateCompanyInput {
  name?: string;
}

export interface FilterCompaniesInput extends FilterInput {
  name?: FilterItem<string>[];
}

export interface AddFinancialInstitutionInput {
  financialInstitutionId: string;
  credentials: any; // should be type JSON
}

export interface RemoveFinancialInstitutionInput {
  financialInstitutionId: string;
}
