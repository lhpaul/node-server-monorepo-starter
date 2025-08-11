import { FilterInput, FilterItem } from '../../definitions/domain.interfaces';

export interface CreateFinancialInstitutionInput {
  countryCode: string;
  name: string;
}

export interface FilterFinancialInstitutionsInput extends FilterInput {
  countryCode?: FilterItem<string>[];
  name?: FilterItem<string>[];
} 

export interface UpdateFinancialInstitutionInput {
  countryCode?: string;
  name?: string;
}