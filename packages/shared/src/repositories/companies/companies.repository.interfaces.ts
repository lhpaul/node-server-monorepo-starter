import { QueryInput, QueryItem } from '../../definitions/listing.interfaces';

export interface CreateCompanyInput {
  name: string;
}

export interface UpdateCompanyInput {
  name?: string;
}

export interface GetCompaniesQuery extends QueryInput {
  name?: QueryItem<string>[];
}
