import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface CompanyDocument extends DocumentModel {
  countryCode: string;
  name: string;
}

export interface CreateCompanyDocumentInput {
  countryCode: string;
  name: string;
}

export interface UpdateCompanyDocumentInput {
  countryCode?: string;
  name?: string;
}

export interface QueryCompaniesInput extends QueryInput {
  countryCode?: QueryItem<string>[];
  name?: QueryItem<string>[];
}
