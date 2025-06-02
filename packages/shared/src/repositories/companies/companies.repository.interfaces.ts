import { QueryInput, QueryOptions } from '../../definitions/listing.interfaces';

export interface CreateCompanyBody {
  name: string;
}

export interface UpdateCompanyBody {
  name?: string;
}

export interface GetCompaniesQuery extends QueryInput {
  name?: QueryOptions<string>[];
}
