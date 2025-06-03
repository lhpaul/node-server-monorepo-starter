import { Company } from '../../domain/models/company.model';

export const MOCK_COMPANIES: Company[] = [
  new Company({ createdAt: new Date(), id: '0', name: 'Acme Corp', updatedAt: new Date() }),
  new Company({ createdAt: new Date(), id: '1', name: 'TechStart Inc', updatedAt: new Date() }),
  new Company({ createdAt: new Date(), id: '2', name: 'Global Solutions Ltd', updatedAt: new Date() }),
];
