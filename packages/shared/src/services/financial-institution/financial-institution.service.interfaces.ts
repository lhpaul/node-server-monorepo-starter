import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface FinancialInstitutionConfig {
  financialInstitutionId: string;
}

export interface GetTransactionsInput {
  companyId: string;
  fromDate: string;
  toDate: string;
}