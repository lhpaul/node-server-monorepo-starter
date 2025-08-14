import { FilterInput, FilterItem } from '../../../definitions/domain.interfaces';

export interface CreateUserCompanyRelationInput {
  companyId: string;
  userId: string;
  role: string;
}

export interface FilterUserCompanyRelationsInput extends FilterInput {
  companyId?: FilterItem<string>[];
  userId?: FilterItem<string>[];
  role?: FilterItem<string>[];
}

export interface UpdateUserCompanyRelationInput {
  role?: string;
}
