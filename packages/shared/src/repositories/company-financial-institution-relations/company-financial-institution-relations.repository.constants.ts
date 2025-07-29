import { CompanyFinancialInstitutionRelationDocument } from './company-financial-institution-relations.repository.interfaces';

export const STEPS = {
  GET_RELATED_DOCUMENTS: {
    id: 'get-related-documents',
    label: 'Get related documents',
  },
}

export const ERROR_MESSAGES = {
  COMPANY_NOT_FOUND: 'Related company not found',
  FINANCIAL_INSTITUTION_NOT_FOUND: 'Related financial institution not found',
}

export const MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS: CompanyFinancialInstitutionRelationDocument[] = [
  {
    id: '0',
    companyId: '0',
    financialInstitutionId: '0',
    encryptedCredentials: 'encrypted-credentials-0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1',
    companyId: '1',
    financialInstitutionId: '0',
    encryptedCredentials: 'encrypted-credentials-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyId: '0',
    financialInstitutionId: '1',
    encryptedCredentials: 'encrypted-credentials-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 