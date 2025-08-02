import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface FinancialInstitutionDocument extends DocumentModel {
  countryCode: string;
  name: string;
}

export interface CreateFinancialInstitutionDocumentInput {
  countryCode: string;
  name: string;
}

export interface UpdateFinancialInstitutionDocumentInput {
  countryCode?: string;
  name?: string;
}

export interface QueryFinancialInstitutionsInput extends QueryInput {
  countryCode?: QueryItem<string>[];
  name?: QueryItem<string>[];
} 