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
