import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface CompanyFinancialInstitutionRelationDocument extends DocumentModel {
  companyId: string;
  financialInstitutionId: string;
  encryptedCredentials: string;
}

export interface CreateCompanyFinancialInstitutionRelationDocumentInput {
  companyId: string;
  financialInstitutionId: string;
  encryptedCredentials: string;
}

export interface UpdateCompanyFinancialInstitutionRelationDocumentInput {
  encryptedCredentials?: string;
}

export interface QueryCompanyFinancialInstitutionRelationsInput extends QueryInput {
  companyId?: QueryItem<string>[];
  financialInstitutionId?: QueryItem<string>[];
  createdAt?: QueryItem<Date>[];
  updatedAt?: QueryItem<Date>[];
} 