import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface CompanyDocument extends DocumentModel {
  name: string;
}

export interface CreateCompanyDocumentInput {
  name: string;
}

export interface UpdateCompanyDocumentInput {
  name?: string;
}

export interface QueryCompaniesInput extends QueryInput {
  name?: QueryItem<string>[];
}
