import { IQueryInput, IQueryOptions } from '../../definitions/listing.interfaces';

export interface CreateCompanyInput {
  name: string;
}

export interface UpdateCompanyInput {
  name?: string;
}

export interface GetCompaniesQuery extends IQueryInput {
  name?: IQueryOptions<string>[];
}
