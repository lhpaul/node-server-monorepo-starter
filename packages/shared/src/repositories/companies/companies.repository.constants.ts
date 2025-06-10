import { CompanyDocument } from './companies.repository.interfaces';

export const MOCK_COMPANIES: CompanyDocument[] = [
  { createdAt: new Date(), id: '0', name: 'Acme Corp', updatedAt: new Date() },
  { createdAt: new Date(), id: '1', name: 'TechStart Inc', updatedAt: new Date() },
  { createdAt: new Date(), id: '2', name: 'Global Solutions Ltd', updatedAt: new Date() },
];
