import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface FinancialInstitutionConfig {
  financialInstitutionId: string;
}

export interface GetTransactionsInput {
  companyId: string;
  fromDate: string;
  toDate: string;
}
export interface CreateFinancialInstitutionInput {
  name: string;
}

export interface UpdateFinancialInstitutionInput {
  name?: string;
}

export interface FilterFinancialInstitutionsInput extends FilterInput {
  name?: FilterItem<string>[];
} 