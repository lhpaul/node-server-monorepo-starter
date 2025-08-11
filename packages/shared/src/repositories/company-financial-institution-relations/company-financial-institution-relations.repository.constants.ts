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
    // username: 'test-username. password: 'test-password'
    encryptedCredentials: 'YWUzYjZlZGEyOTk5ZmJlMjY1NzY1M2UyZmViMzRjNzY6ZDkzOTgwZWRlZjkzZjljNGE1ZjBkN2Q3MTJmOTFjMGY6YWI0ZTVjNTQ2YTFkNWEwMWYzY2I0Zjg5YTgyOTYwZWI1OGVmOTIxODAzY2MzMjEzMDQ4NTU5NmU2OGIzOGZjNGI5NTU4NWIwZjU4MzRjYzFhOTZiNzExMWM5NzE0YTFjODc2N2M4MGE3ZTQ4MjY3OTVjNTFiMjk4ODkxY2I5MTU=',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1',
    companyId: '1',
    financialInstitutionId: '0',
    // username: 'test-username. password: 'test-password'
    encryptedCredentials: 'YWUzYjZlZGEyOTk5ZmJlMjY1NzY1M2UyZmViMzRjNzY6ZDkzOTgwZWRlZjkzZjljNGE1ZjBkN2Q3MTJmOTFjMGY6YWI0ZTVjNTQ2YTFkNWEwMWYzY2I0Zjg5YTgyOTYwZWI1OGVmOTIxODAzY2MzMjEzMDQ4NTU5NmU2OGIzOGZjNGI5NTU4NWIwZjU4MzRjYzFhOTZiNzExMWM5NzE0YTFjODc2N2M4MGE3ZTQ4MjY3OTVjNTFiMjk4ODkxY2I5MTU=',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyId: '0',
    financialInstitutionId: '1',
    // username: 'test-username. password: 'test-password'
    encryptedCredentials: 'YWUzYjZlZGEyOTk5ZmJlMjY1NzY1M2UyZmViMzRjNzY6ZDkzOTgwZWRlZjkzZjljNGE1ZjBkN2Q3MTJmOTFjMGY6YWI0ZTVjNTQ2YTFkNWEwMWYzY2I0Zjg5YTgyOTYwZWI1OGVmOTIxODAzY2MzMjEzMDQ4NTU5NmU2OGIzOGZjNGI5NTU4NWIwZjU4MzRjYzFhOTZiNzExMWM5NzE0YTFjODc2N2M4MGE3ZTQ4MjY3OTVjNTFiMjk4ODkxY2I5MTU=',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 