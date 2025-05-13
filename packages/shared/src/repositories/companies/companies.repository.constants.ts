import { Company } from '../../domain/models/company.model';

export const MOCK_COMPANIES: Company[] = [
  new Company({ id: '1', name: 'Acme Corp' }),
  new Company({ id: '2', name: 'TechStart Inc' }),
  new Company({ id: '3', name: 'Global Solutions Ltd' }),
];

export const ERROR_MESSAGES = {
  DOCUMENT_NOT_FOUND: 'Company not found',
};
