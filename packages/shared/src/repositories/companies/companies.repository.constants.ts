import { Company } from '../../domain/models/company.model';

export const MOCK_COMPANIES: Company[] = [
  new Company({ createdAt: new Date(), id: '1', name: 'Acme Corp', updatedAt: new Date() }),
  new Company({ createdAt: new Date(), id: '2', name: 'TechStart Inc', updatedAt: new Date() }),
  new Company({ createdAt: new Date(), id: '3', name: 'Global Solutions Ltd', updatedAt: new Date() }),
];

export const ERROR_MESSAGES = {
  DOCUMENT_NOT_FOUND: 'Company not found',
};
