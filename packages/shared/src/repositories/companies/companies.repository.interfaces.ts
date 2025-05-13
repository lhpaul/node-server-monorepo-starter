import { QueryOptions } from '../../definitions/listing.interfaces';

export interface CreateCompanyBody {
  name: string;
}

export interface UpdateCompanyBody {
  name?: string;
}

export interface GetCompaniesQuery {
  name?: QueryOptions<string>[];
}
