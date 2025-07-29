import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface FinancialInstitutionDocument extends DocumentModel {
  name: string;
}

export interface CreateFinancialInstitutionDocumentInput {
  name: string;
}

export interface UpdateFinancialInstitutionDocumentInput {
  name?: string;
}

export interface QueryFinancialInstitutionsInput extends QueryInput {
  name?: QueryItem<string>[];
} 